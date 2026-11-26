const { parse } = require("csv-parse/sync");
const { ApiError } = require("../middleware/apiErrors");
const { readWorkbook, MAX_ROWS, MAX_COLUMNS } = require("./workbookImport");
const { issue, normalize } = require("./allocationValidation");

const headers = {
  flat: "flatNumber", flat_no: "flatNumber", flat_number: "flatNumber",
  slot: "slotNumber", slot_no: "slotNumber", slot_number: "slotNumber",
  vehicle: "vehicleNumber", vehicle_id: "vehicleNumber", vehicle_number: "vehicleNumber",
  notes: "notes",
};
const fields = ["flatNumber", "slotNumber", "vehicleNumber", "notes"];

function readCsv(buffer) {
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    if (text.includes("\0")) throw new Error();
    return parse(text, {
      bom: true, info: true, max_record_size: 8192, skip_empty_lines: false,
    }).map(({ record, info }) => ({
      line: info.records, cells: new Map(record.map((value, column) => [column, { value, kind: "inlineStr" }])),
    }));
  } catch {
    throw new ApiError(400, "Upload a valid UTF-8 CSV with the same column count on each row.");
  }
}

async function parseAllocationFile(buffer, contentType, filename) {
  const type = contentType?.split(";")[0].trim().toLowerCase();
  const extension = typeof filename === "string" ? filename.split(".").at(-1).toLowerCase() : "";
  const isXlsx = extension === "xlsx" && type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const isCsv = extension === "csv" && type === "text/csv";
  if (!isXlsx && !isCsv) throw new ApiError(415, "Use a matching .xlsx or .csv filename and MIME type.");
  if (!Buffer.isBuffer(buffer) || !buffer.length) throw new ApiError(400, "Upload a nonempty allocation file.");
  const records = isXlsx ? await readWorkbook(buffer) : readCsv(buffer);
  if (records.length > MAX_ROWS || records.some(({ cells }) => cells.size > MAX_COLUMNS)) {
    throw new ApiError(400, "Use at most 250 allocation rows and 16 columns.");
  }

  const importIssues = [];
  const rows = [];
  const columns = new Map();
  for (const [column, cell] of records[0]?.cells ?? []) {
    if (cell.formula) importIssues.push(issue(1, "headers", "FORMULA_CELL", "Replace the formula with a text header."));
    const key = normalize(cell.value).toLowerCase().replace(/[\s-]+/g, "_");
    if (!Object.hasOwn(headers, key)) continue;
    const field = headers[key];
    if (columns.has(field)) importIssues.push(issue(1, field, "DUPLICATE_COLUMN", "Keep only one column for this field."));
    else columns.set(field, column);
  }
  if (records[0]?.line !== 1) importIssues.push(issue(1, "headers", "HEADER_ROW", "Put the column headers in row 1."));
  for (const field of fields.slice(0, 2)) {
    if (!columns.has(field)) importIssues.push(issue(1, field, "MISSING_COLUMN", "Add the required column to the header."));
  }

  for (const { line, cells } of records.slice(1)) {
    if (![...cells.values()].some((cell) => cell.formula || normalize(cell.value))) continue;
    const entry = { row: line };
    for (const [column, cell] of cells) {
      if (cell.formula && ![...columns.values()].includes(column)) {
        importIssues.push(issue(line, "rows", "FORMULA_CELL", "Remove formulas from the upload."));
      }
    }
    for (const field of fields) {
      const cell = cells.get(columns.get(field));
      let value = normalize(cell?.value);
      if (cell?.formula) {
        importIssues.push(issue(line, field, "FORMULA_CELL", "Replace the formula with its reviewed text value."));
        value = "";
      } else if (isXlsx && value && !["s", "inlineStr", "str"].includes(cell?.kind)) {
        importIssues.push(issue(line, field, "TEXT_CELL_REQUIRED", "Format the cell as Text and re-enter the value."));
        value = "";
      } else if (value.length > (field === "notes" ? 500 : 128)) {
        importIssues.push(issue(line, field, "CELL_TOO_LONG", "Shorten the value before importing."));
        value = "";
      }
      entry[field] = field === "vehicleNumber" ? value.toUpperCase() : value;
    }
    rows.push(entry);
  }
  return { source: isXlsx ? "XLSX" : "CSV", rows, importIssues };
}

function exportCsv(rows) {
  const quote = (value) => {
    let cell = value ?? "";
    if (/^[\s\uFEFF]*[=+@\uFF1D\uFF0B\uFF0D\uFF20-]|^[\t\r\n]/u.test(cell)) cell = "'" + cell;
    return '"' + cell.replaceAll('"', '""') + '"';
  };
  return ["flat_number,slot_number,vehicle_number,notes",
    ...rows.map((row) => fields.map((field) => quote(row[field])).join(","))].join("\r\n") + "\r\n";
}

module.exports = { parseAllocationFile, exportCsv };
