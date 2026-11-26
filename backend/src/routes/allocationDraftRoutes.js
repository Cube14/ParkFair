const ParkingAssignment = require("../models/ParkingAssignment");
const { Router, raw } = require("express");
const { AllocationDraft, AllocationPublication, AdminAudit } = require("../models/AllocationWorkflow");
const service = require("../services/allocationDrafts");
const { parseAllocationFile, exportCsv } = require("../services/allocationImport");
const { manualRows, normalize } = require("../services/allocationValidation");
const { ApiError } = require("../middleware/apiErrors");
const { id, positiveInteger, validateBody, validateIds } = require("../middleware/validateRequest");

const router = Router();
const fields = ["flatNumber", "vehicleNumber", "slotNumber", "notes"];
const rows = (entries) => Array.isArray(entries) && entries.length <= 250 &&
  entries.every((entry) => entry && typeof entry === "object" && !Array.isArray(entry) &&
    Object.entries(entry).every(([key, value]) => fields.includes(key) && typeof value === "string" &&
      value.length <= (key === "notes" ? 500 : 128)));

const exclusions = (items) => Array.isArray(items) && items.length <= 250 && items.every((item) =>
  item && Object.keys(item).length === 2 && typeof item.flatNumber === "string" &&
  item.flatNumber.length <= 128 && normalize(item.flatNumber) &&
  typeof item.reason === "string" && item.reason.length <= 500 && normalize(item.reason));
const cleanExclusions = (items) => items?.map(({ flatNumber, reason }) => ({
  flatNumber: normalize(flatNumber), reason: normalize(reason),
}));

const revision = (value) => {
  const parsed = typeof value === "string" && /^[1-9]\d*$/.test(value) ? Number(value) : NaN;
  if (!positiveInteger(parsed)) throw new ApiError(400, "Supply a positive revision number.");
  return parsed;
};
const send = (res, result, status = 200) => {
  if (result.stale) {
    return res.status(409).json({
      success: false, code: "STALE_REVIEW", message: "Allocation data changed. Validate and review the revision again.",
      issues: result.issues, coverage: result.coverage,
    });
  }
  return res.status(status).json({ success: true, ...result });
};
const actor = (req) => ({ actorId: req.user.id, draftId: req.params.draftId });

router.get("/", async (req, res) => {
  const cycleId = req.query.cycleId;
  if (cycleId !== undefined && !id(cycleId)) throw new ApiError(400, "Invalid cycle ID.");
  res.json({ success: true, drafts: await AllocationDraft.find(cycleId ? { cycleId } : {})
    .sort({ updatedAt: -1, _id: -1 }).limit(100) });
});
router.post("/", validateBody({ cycleId: id }, { rows, exclusions, copyAssignments: (value) => typeof value === "boolean" }), async (req, res) => {
  const { cycleId, copyAssignments, rows: input } = req.body;
  if (copyAssignments && input) throw new ApiError(400, "Choose copied assignments or manual rows.");
  send(res, await service.createDraft({ ...actor(req), cycleId, copyAssignments, rows: manualRows(input ?? []), exclusions: cleanExclusions(req.body.exclusions) }), 201);
});
router.get("/publications/:cycleId", validateIds("cycleId"), async (req, res) => {
  res.json({ success: true, publications: await AllocationPublication.find({
    cycleId: req.params.cycleId,
  }).select("-key").sort({ sequence: -1 }).limit(100) });
});
router.get("/publications/:cycleId/:publicationId", validateIds("cycleId", "publicationId"), async (req, res) => {
  const { cycleId, publicationId } = req.params;
  const publication = await AllocationPublication.findOne({ _id: publicationId, cycleId }).select("-key");
  if (!publication) throw new ApiError(404, "Publication not found.");
  const assignments = await ParkingAssignment.find({ publicationId }).sort({ flatNumber: 1 });
  send(res, { publication, assignments });
});
router.get("/audit/:entityId", validateIds("entityId"), async (req, res) => {
  res.json({ success: true, events: await AdminAudit.find({ entityId: req.params.entityId })
    .sort({ createdAt: -1, _id: -1 }).limit(100) });
});
router.get("/:draftId", validateIds("draftId"), async (req, res) => {
  send(res, await service.draftDetails(req.params.draftId));
});
router.get("/:draftId/revisions/:revision", validateIds("draftId"), async (req, res) => {
  const version = await service.versionByNumber(req.params.draftId, revision(req.params.revision));
  send(res, { version });
});
router.get("/:draftId/coverage", validateIds("draftId"), async (req, res) => {
  send(res, await service.getCoverage(req.params.draftId));
});
router.get("/:draftId/compare", validateIds("draftId"), async (req, res) => {
  const changes = await service.compare(req.params.draftId, revision(req.query.from), revision(req.query.to));
  send(res, { changes });
});
router.get("/:draftId/export.csv", validateIds("draftId"), async (req, res) => {
  const { version } = await service.draftDetails(req.params.draftId);
  res.attachment("parkfair-allocation.csv").type("text/csv").send(exportCsv(version.rows));
});
router.put("/:draftId", validateIds("draftId"), validateBody({ revision: positiveInteger, rows }, { exclusions }), async (req, res) => {
  send(res, await service.reviseDraft({
    ...actor(req), expectedRevision: req.body.revision, rows: manualRows(req.body.rows), source: "MANUAL", importIssues: [], exclusions: cleanExclusions(req.body.exclusions),
  }));
});
const upload = raw({
  type: ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  limit: "1mb", inflate: false,
});
const parseUpload = (req) => parseAllocationFile(req.body, req.get("Content-Type"),
  req.get("X-ParkFair-Filename"), req.get("X-ParkFair-Columns"));
router.post("/:draftId/import-preview", validateIds("draftId"), upload, async (req, res) => {
  await service.draftDetails(req.params.draftId);
  const { columns, importIssues, rows: parsed } = await parseUpload(req);
  send(res, { columns, importIssues, dataRows: parsed.length });
});
router.post("/:draftId/import", validateIds("draftId"), upload, async (req, res) => {
  const expectedRevision = revision(req.get("If-Match")?.replace(/^"(\d+)"$/, "$1"));
  const imported = await parseUpload(req);
  send(res, await service.reviseDraft({ ...actor(req), expectedRevision, ...imported }), 201);
});
for (const action of ["validate", "approve", "cancel"]) {
  router.post(`/:draftId/${action}`, validateIds("draftId"), validateBody({ revision: positiveInteger }), async (req, res) => {
    send(res, await service.reviewDraft({ ...actor(req), expectedRevision: req.body.revision, action }));
  });
}
router.post("/:draftId/publish", validateIds("draftId"), validateBody({ revision: positiveInteger }), async (req, res) => {
  const key = req.get("Idempotency-Key");
  if (!key || !/^[a-zA-Z0-9._:-]{16,100}$/.test(key)) throw new ApiError(400, "Provide a unique Idempotency-Key.");
  const result = await service.publish({ ...actor(req), expectedRevision: req.body.revision, key });
  if (result.publication) {
    const { key: _, ...publication } = result.publication.toObject();
    result.publication = publication;
  }
  send(res, result, result.replayed ? 200 : 201);
});

module.exports = router;
