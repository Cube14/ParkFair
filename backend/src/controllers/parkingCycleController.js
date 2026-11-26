const ParkingCycle = require("../models/ParkingCycle");
const ParkingAssignment = require("../models/ParkingAssignment");
const { AllocationDraft, AllocationRevision, AllocationPublication } = require("../models/AllocationWorkflow");
const { parkingWrite, audit } = require("../services/parkingWrite");
const { societyDay, dayAfter } = require("../services/cycleSelection");
const { assess } = require("../services/allocationValidation");
const { ApiError } = require("../middleware/apiErrors");

async function createCycle(req, res) {
  if (req.body.status && req.body.status !== "PLANNED") {
    throw new ApiError(409, "Create a planned cycle, then publish and activate its approved allocation.");
  }
  const data = await parkingWrite(async (session) => {
    const [cycle] = await ParkingCycle.create([{ ...req.body, status: "PLANNED" }], { session });
    return cycle;
  });
  res.status(201).json({ success: true, data });
}

async function getCycles(req, res) {
  const data = await ParkingCycle.find().sort({ startDate: 1 });
  res.json({ success: true, count: data.length, data });
}

async function activatePublication(cycle, session, now) {
  const publication = await AllocationPublication.findOne({
    _id: cycle.latestPublicationId, cycleId: cycle._id,
  }).session(session);
  const version = publication && await AllocationRevision.findOne({
    draftId: publication.draftId, revision: publication.revision,
  }).session(session);
  if (!version) throw new ApiError(409, "Published revision is unavailable.");
  const checked = await assess(cycle, version, session, now);
  const stored = await ParkingAssignment.find({ publicationId: publication._id }).session(session);
  const signature = (rows) => rows.map(({ flatId, vehicleId, slotId, parkingType }) =>
    [flatId, vehicleId, slotId, parkingType].join(":")).sort().join("|");
  if (checked.issues.length || signature(checked.resolved) !== signature(stored)) {
    throw new ApiError(409, "The published chart no longer matches inventory. Publish a reviewed correction.");
  }
  if (!cycle.activePublicationId && cycle.status === "ACTIVE") cycle.legacySupersededAt = now;
  cycle.activePublicationId = publication._id;
  if (!publication.activatedAt) {
    publication.activatedAt = now;
    await publication.save({ session });
  }
}

async function setStatusInTransaction(cycleId, status, actorId, session, now = new Date(), publicationId) {
  const cycle = await ParkingCycle.findById(cycleId).session(session);
  if (!cycle) throw new ApiError(404, "Cycle not found.");
  if (status === "PLANNED" && cycle.status !== "PLANNED") {
    throw new ApiError(409, "An effective or completed cycle cannot return to planning.");
  }
  if (status === "ACTIVE") {
    if (publicationId && !cycle.latestPublicationId?.equals(publicationId)) {
      throw new ApiError(409, "This publication has been superseded.");
    }
    const today = societyDay(now);
    if (cycle.status === "COMPLETED" || cycle.startDate >= dayAfter(today) || cycle.endDate < today) {
      throw new ApiError(409, "Only an open cycle effective today can be activated.");
    }
    if (!cycle.latestPublicationId && cycle.status !== "ACTIVE") {
      throw new ApiError(409, "Publish an approved allocation before activating this cycle.");
    }
    if (await ParkingCycle.exists({
      _id: { $ne: cycle._id }, status: "ACTIVE",
      startDate: { $lt: dayAfter(today) }, endDate: { $gte: today },
    }).session(session)) {
      throw new ApiError(409, "Another cycle is already effective today.");
    }
    await ParkingCycle.updateMany({
      _id: { $ne: cycle._id }, status: "ACTIVE", endDate: { $lt: today },
    }, { status: "COMPLETED" }, { session });
    if (cycle.latestPublicationId && !cycle.activePublicationId?.equals(cycle.latestPublicationId)) {
      await activatePublication(cycle, session, now);
    } else if (cycle.status === "ACTIVE") {
      return cycle;
    }
  }
  if (status !== cycle.status || cycle.isModified("activePublicationId")) {
    cycle.status = status;
    await cycle.save({ session });
    await audit(session, {
      actorId, action: status === "ACTIVE" ? "CYCLE_ACTIVATED" : "CYCLE_COMPLETED", entityId: cycle._id,
      revision: cycle.publicationSequence,
    });
  }
  return cycle;
}

function setStatus(cycleId, status, actorId, publicationId) {
  return parkingWrite((session) => setStatusInTransaction(cycleId, status, actorId, session, new Date(), publicationId));
}

async function updateCycleStatus(req, res) {
  const data = await setStatus(req.params.id, req.body.status, req.user.id, req.body.publicationId);
  res.json({ success: true, message: "Cycle status updated", data });
}

async function completeCycle(req, res) {
  const data = await setStatus(req.params.id, "COMPLETED", req.user.id);
  res.json({ success: true, message: "Cycle completed successfully", data });
}

async function deleteCycle(req, res) {
  const cycleId = req.params.id;
  await parkingWrite(async (session) => {
    if (await ParkingAssignment.exists({ cycleId }).session(session) ||
        await AllocationDraft.exists({ cycleId }).session(session)) {
      throw new ApiError(409, "A cycle with assignments or draft history cannot be deleted.");
    }
    const result = await ParkingCycle.deleteOne({ _id: cycleId }, { session });
    if (!result.deletedCount) throw new ApiError(404, "Cycle not found.");
  });
  res.json({ success: true, message: "Cycle deleted" });
}

module.exports = { createCycle, getCycles, deleteCycle, updateCycleStatus, completeCycle, setStatusInTransaction };
