const path = require("node:path").posix;
const { SaxesParser } = require("saxes");
const yauzl = require("yauzl");
const { ApiError } = require("../middleware/apiErrors");

const MAX_EXPANDED_BYTES = 4 * 1024 * 1024;
const MAX_ROWS = 251;
const MAX_COLUMNS = 16;
const utf8 = new TextDecoder("utf-8", { fatal: true });
const invalid = () => new ApiError(400, "Upload a valid .xlsx workbook with one allocation worksheet.");

async function archive(buffer) {
  if (buffer.subarray(0, 4).toString("hex") !== "504b0304") throw invalid();
  const zip = await new Promise((resolve, reject) => yauzl.fromBuffer(buffer, {
    lazyEntries: true, validateEntrySizes: true, strictFileNames: true, autoClose: false,
  }, (error, file) => error ? reject(error) : resolve(file)));
  const entries = new Map();
  let bytes = 0;
  try {
    if (zip.entryCount > 48) throw invalid();
    await new Promise((resolve, reject) => {
      zip.once("error", reject);
      zip.once("end", resolve);
      zip.on("entry", (entry) => {
        const name = entry.fileName;
        bytes += entry.uncompressedSize;
        if (bytes > MAX_EXPANDED_BYTES || entries.has(name) || entry.isEncrypted() ||
          /(?:vbaproject|macrosheet|externallinks|embeddings|activex|connections\.xml)/i.test(name)) {
          reject(invalid());
          return;
        }
        if (name.endsWith("/")) {
          entries.set(name, null);
          zip.readEntry();
          return;
        }
        zip.openReadStream(entry, async (error, stream) => {
          if (error) return reject(error);
          try {
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            entries.set(name, Buffer.concat(chunks));
            zip.readEntry();
          } catch (failure) {
            reject(failure);
          }
        });
      });
      zip.readEntry();
    });
    return entries;
  } finally {
    zip.close();
  }
}

const local = (name) => name.split(":").at(-1);

function xml(buffer, onOpen, onClose, onText) {
  if (!buffer) throw invalid();
  const parser = new SaxesParser();
  let depth = 0;
  parser.on("doctype", () => { throw invalid(); });
  parser.on("opentag", (tag) => {
    if (++depth > 48) throw invalid();
    onOpen(local(tag.name), tag.attributes, depth);
  });
  parser.on("closetag", (tag) => { onClose?.(local(tag.name), depth); depth--; });
  parser.on("text", (value) => onText?.(value));
  parser.on("cdata", (value) => onText?.(value));
  parser.write(utf8.decode(buffer)).close();
}

function worksheetFile(entries) {
  for (const [name, data] of entries) {
    if (name.endsWith(".rels")) xml(data, (tag, attr) => {
      if (tag === "Relationship" && attr.TargetMode?.toLowerCase() === "external") throw invalid();
    });
  }
  let workbookType = false;
  xml(entries.get("[Content_Types].xml"), (tag, attr) => {
    if (/macro|vba/i.test(attr.ContentType ?? "")) throw invalid();
    if (((tag === "Override" && attr.PartName === "/xl/workbook.xml") ||
         (tag === "Default" && attr.Extension === "xml")) &&
        attr.ContentType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml") {
      workbookType = true;
    }
  });
  if (!workbookType) throw invalid();
  const sheets = [];
  xml(entries.get("xl/workbook.xml"), (tag, attr) => {
    if (tag === "sheet") sheets.push(attr["r:id"]);
    if (tag === "definedName" || tag === "externalReference") throw invalid();
  });
  if (sheets.length !== 1 || !sheets[0]) throw invalid();
  let sheet;
  xml(entries.get("xl/_rels/workbook.xml.rels"), (tag, attr) => {
    if (tag === "Relationship" && attr.Id === sheets[0] && attr.Type?.endsWith("/worksheet") && attr.Target) {
      if (sheet) throw invalid();
      sheet = path.resolve("/xl", attr.Target).slice(1);
    }
  });
  if (!sheet || !/^xl\/worksheets\/[\w.-]+\.xml$/.test(sheet)) throw invalid();
  return entries.get(sheet);
}

function strings(buffer) {
  if (!buffer) return [];
  const values = [];
  let active = false;
  let textDepth = 0;
  let value = "";
  xml(buffer, (tag, _, depth) => {
    if (tag === "si") { active = true; value = ""; }
    if (active && tag === "t") textDepth = depth;
  }, (tag, depth) => {
    if (depth === textDepth) textDepth = 0;
    if (tag === "si") {
      if (values.length >= 5000) throw invalid();
      values.push(value);
      active = false;
    }
  }, (text) => { if (textDepth) value += text; });
  return values;
}

function parseWorksheet(buffer, shared) {
  const rows = [];
  let row;
  let cell;
  let valueDepth = 0;
  let inData = false;
  let previousRow = 0;
  xml(buffer, (tag, attr, depth) => {
    if (depth === 1 && tag !== "worksheet") throw invalid();
    if (tag === "sheetData" && depth === 2) inData = true;
    if (tag === "mergeCell") throw invalid();
    if (!inData) return;
    if (tag === "row" && depth === 3) {
      const line = Number(attr.r);
      if (!Number.isInteger(line) || line <= previousRow || line > MAX_ROWS) throw invalid();
      row = { line, cells: new Map() };
      previousRow = line;
    }
    if (row && tag === "c" && depth === 4) {
      const position = /^([A-P])([1-9]\d*)$/.exec(attr.r ?? "");
      const column = position?.[1].charCodeAt(0) - 65;
      if (!position || Number(position[2]) !== row.line || column >= MAX_COLUMNS || row.cells.has(column)) throw invalid();
      cell = { column, kind: attr.t ?? "n", value: "", formula: false };
    }
    if (cell && tag === "f") cell.formula = true;
    if (cell && (tag === "v" || tag === "t")) valueDepth = depth;
  }, (tag, depth) => {
    if (tag === "sheetData" && depth === 2) inData = false;
    if (depth === valueDepth) valueDepth = 0;
    if (cell && tag === "c" && depth === 4) {
      if (cell.kind === "s" && !cell.formula) {
        if (!/^\d+$/.test(cell.value) || shared[Number(cell.value)] === undefined) throw invalid();
        cell.value = shared[Number(cell.value)];
      }
      row.cells.set(cell.column, cell);
      cell = undefined;
    }
    if (row && tag === "row" && depth === 3) {
      rows.push(row);
      row = undefined;
    }
  }, (text) => { if (cell && valueDepth) cell.value += text; });
  return rows;
}

async function readWorkbook(buffer) {
  try {
    const entries = await archive(buffer);
    return parseWorksheet(worksheetFile(entries), strings(entries.get("xl/sharedStrings.xml")));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw invalid();
  }
}

module.exports = { readWorkbook, MAX_ROWS, MAX_COLUMNS };
