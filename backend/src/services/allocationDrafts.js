const { createHash } = require("node:crypto");
const ParkingCycle = require("../models/ParkingCycle");
const ParkingAssignment = require("../models/ParkingAssignment");
const { AllocationDraft, AllocationRevision, AllocationPublication, NotificationOutbox } =
  require("../models/AllocationWorkflow");
const { ApiError } = require("../middleware/apiErrors");
const { parkingWrite, audit } = require("./parkingWrite");
const { assess } = require("./allocationValidation");
const { visibleAssignments } = require("./assignmentVisibility");

function checkedRevision(draft, expected) {
  if (draft.revision !== expected) throw new ApiError(409, "The draft changed. Reload its latest revision.");
  if (["PUBLISHED", "CANCELLED"].includes(draft.status)) {
    throw new ApiError(409, "This draft is closed. Start a new draft for corrections.");
  }
}

async function draftById(draftId, session) {
  const draft = await AllocationDraft.findById(draftId).session(session);
  if (!draft) throw new ApiError(404, "Allocation draft not found.");
  return draft;
}

async function cycleById(cycleId, session) {
  const cycle = await ParkingCycle.findById(cycleId).session(session);
  if (!cycle) throw new ApiError(404, "Parking cycle not found.");
  return cycle;
}

async function versionByNumber(draftId, revision, session = null) {
  const version = await AllocationRevision.findOne({ draftId, revision }).session(session);
  if (!version) throw new ApiError(404, "Draft revision not found.");
  return version;
}

function fingerprint(cycle, { resolved, coverage }) {
  return createHash("sha256").update(JSON.stringify([
    cycle.startDate, cycle.endDate, cycle.durationDays, cycle.latestPublicationId ?? null, resolved, coverage,
  ])).digest("hex");
}

async function sourceRows(cycle, session) {
  const assignments = await ParkingAssignment.find({
    ...visibleAssignments(cycle), assignmentStatus: "ACTIVE",
  }).populate("flatId", "flatNumber").populate("slotId", "slotNumber")
    .populate("vehicleId", "vehicleNumber").sort("_id").session(session);
  if (assignments.length > 250) throw new ApiError(409, "This cycle exceeds the draft row limit.");
  return assignments.map((entry, i) => ({
    row: i + 2,
    flatNumber: entry.flatId?.flatNumber ?? "",
    slotNumber: entry.slotId?.slotNumber ?? "",
    vehicleNumber: entry.vehicleId?.vehicleNumber ?? "",
    notes: entry.notes ?? "",
  }));
}

function createDraft({ cycleId, actorId, rows, copyAssignments, exclusions }) {
  return parkingWrite(async (session) => {
    const cycle = await cycleById(cycleId, session);
    if (cycle.status === "COMPLETED") throw new ApiError(409, "Completed cycles are closed to new drafts.");
    const [draft] = await AllocationDraft.create([{ cycleId, revision: 1, status: "DRAFT" }], { session });
    const draftRows = copyAssignments ? await sourceRows(cycle, session) : rows;
    const [version] = await AllocationRevision.create([{
      draftId: draft._id, revision: 1, actorId, rows: draftRows, exclusions, source: copyAssignments ? "LEGACY" : "MANUAL",
    }], { session });
    await audit(session, { actorId, action: "DRAFT_CREATED", entityId: draft._id, revision: 1,
      counts: { rows: draftRows.length } });
    return { draft, version };
  });
}

function reviseDraft({ draftId, expectedRevision, actorId, rows, source, importIssues, exclusions }) {
  return parkingWrite(async (session) => {
    const draft = await draftById(draftId, session);
    checkedRevision(draft, expectedRevision);
    const prior = exclusions === undefined ? await versionByNumber(draftId, draft.revision, session) : null;
    const [version] = await AllocationRevision.create([{
      draftId, actorId, revision: ++draft.revision, source, rows, importIssues,
      exclusions: exclusions ?? prior.exclusions,
    }], { session });
    draft.status = "DRAFT";
    draft.issues = importIssues;
    draft.validatedDigest = undefined;
    draft.approvedDigest = undefined;
    draft.approvedAt = undefined;
    draft.approvedBy = undefined;
    await draft.save({ session });
    await audit(session, {
      actorId, entityId: draft._id, revision: draft.revision,
      action: source === "MANUAL" ? "DRAFT_EDITED" : "DRAFT_IMPORTED",
      counts: { rows: rows.length, errors: importIssues.length },
    });
    return { draft, version };
  });
}

function reviewDraft({ draftId, expectedRevision, actorId, action }) {
  return parkingWrite(async (session) => {
    const draft = await draftById(draftId, session);
    checkedRevision(draft, expectedRevision);
    if (action === "cancel") {
      draft.status = "CANCELLED";
      await draft.save({ session });
      await audit(session, { actorId, action: "DRAFT_CANCELLED", entityId: draft._id, revision: draft.revision });
      return { draft };
    }

    if (action === "approve" && draft.status !== "VALIDATED") {
      throw new ApiError(409, "Validate the latest revision before approving it.");
    }
    if (action === "validate" && draft.status === "APPROVED") {
      throw new ApiError(409, "Edit the approved revision to start another review.");
    }

    const cycle = await cycleById(draft.cycleId, session);
    const version = await versionByNumber(draftId, draft.revision, session);
    const checked = await assess(cycle, version, session);
    const { issues, coverage } = checked;
    const digest = fingerprint(cycle, checked);
    if (action === "approve" && (issues.length || digest !== draft.validatedDigest)) {
      draft.status = "DRAFT";
      draft.issues = issues;
      draft.validatedDigest = undefined;
      await draft.save({ session });
      return { draft, issues, coverage, stale: true };
    }

    draft.status = issues.length ? "DRAFT" : "VALIDATED";
    draft.issues = issues;
    draft.validatedDigest = issues.length ? undefined : digest;
    if (action === "approve") {
      draft.status = "APPROVED";
      draft.approvedBy = actorId;
      draft.approvedAt = new Date();
      draft.approvedDigest = digest;
    }
    await draft.save({ session });
    await audit(session, {
      actorId, entityId: draft._id, revision: draft.revision,
      action: action === "approve" ? "DRAFT_APPROVED" : "DRAFT_VALIDATED",
      counts: { rows: version.rows.length, errors: issues.length },
    });
    return { draft, issues, coverage };
  });
}

function publish({ draftId, expectedRevision, actorId, key }) {
  return parkingWrite(async (session) => {
    const usedKey = await AllocationPublication.findOne({ key }).session(session);
    if (usedKey && (!usedKey.draftId.equals(draftId) || usedKey.revision !== expectedRevision)) {
      throw new ApiError(409, "The publication key was used for another revision.");
    }
    const existing = usedKey ?? await AllocationPublication.findOne({
      draftId, revision: expectedRevision,
    }).session(session);
    if (existing) return { publication: existing, replayed: true };

    const draft = await draftById(draftId, session);
    checkedRevision(draft, expectedRevision);
    if (draft.status !== "APPROVED") throw new ApiError(409, "Approve the specified revision before publishing.");
    const cycle = await cycleById(draft.cycleId, session);
    const version = await versionByNumber(draftId, draft.revision, session);
    const checked = await assess(cycle, version, session);
    if (checked.issues.length || fingerprint(cycle, checked) !== draft.approvedDigest) {
      draft.status = "DRAFT";
      draft.issues = checked.issues;
      draft.validatedDigest = undefined;
      draft.approvedDigest = undefined;
      draft.approvedAt = undefined;
      draft.approvedBy = undefined;
      await draft.save({ session });
      await audit(session, { actorId, action: "APPROVAL_INVALIDATED", entityId: draft._id, revision: draft.revision,
        counts: { errors: checked.issues.length } });
      return { issues: checked.issues, coverage: checked.coverage, stale: true };
    }

    const correction = Boolean(cycle.latestPublicationId || cycle.status === "ACTIVE");
    cycle.publicationSequence = (cycle.publicationSequence ?? 0) + 1;
    const [publication] = await AllocationPublication.create([{
      draftId, cycleId: cycle._id, revision: draft.revision, sequence: cycle.publicationSequence,
      key, actorId, rowCount: checked.resolved.length, exclusions: checked.coverage.excludedFlats, startDate: cycle.startDate, endDate: cycle.endDate,
    }], { session });
    await ParkingAssignment.insertMany(checked.resolved.map((row) => ({
      cycleId: cycle._id, publicationId: publication._id, ...row,
      assignmentStatus: "ACTIVE",
    })), { session });
    await NotificationOutbox.insertMany(checked.resolved.map(({ flatId }) => ({
      eventId: `allocation:${publication.id}:${flatId}`,
      publicationId: publication._id, flatId, channel: "PARKING_ALLOCATION",
      nextAttemptAt: new Date(),
    })), { session });
    cycle.latestPublicationId = publication._id;
    await cycle.save({ session });
    draft.status = "PUBLISHED";
    draft.publicationId = publication._id;
    await draft.save({ session });
    await audit(session, { actorId, action: correction ? "ALLOCATION_CORRECTED" : "ALLOCATION_PUBLISHED",
      entityId: publication._id, revision: draft.revision,
      counts: { rows: checked.resolved.length, jobs: checked.resolved.length } });
    return { publication, replayed: false };
  });
}

async function draftDetails(draftId) {
  const draft = await draftById(draftId, null);
  return { draft, version: await versionByNumber(draftId, draft.revision) };
}

async function getCoverage(draftId) {
  const { draft, version } = await draftDetails(draftId);
  const cycle = await cycleById(draft.cycleId, null);
  const { coverage, issues } = await assess(cycle, version, null);
  return { revision: version.revision, coverage, issues };
}

async function compare(draftId, from, to) {
  const [before, after] = await Promise.all([versionByNumber(draftId, from), versionByNumber(draftId, to)]);
  const prior = new Map(before.rows.map((row) => [row.row, row.toObject()]));
  const next = new Map(after.rows.map((row) => [row.row, row.toObject()]));
  return [...new Set([...prior.keys(), ...next.keys()])].sort((a, b) => a - b).flatMap((row) => {
    const previous = prior.get(row) ?? null;
    const current = next.get(row) ?? null;
    return JSON.stringify(previous) === JSON.stringify(current) ? [] : [{ row, previous, current }];
  });
}

module.exports = { createDraft, reviseDraft, reviewDraft, publish, draftDetails, versionByNumber, compare, getCoverage };
