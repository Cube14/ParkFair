const ParkingAssignment = require("../models/ParkingAssignment");
const { ApiError } = require("../middleware/apiErrors");
const ParkingCycle = require("../models/ParkingCycle");
const { visibleAssignments } = require("../services/assignmentVisibility");
const { parkingWrite } = require("../services/parkingWrite");
const { AllocationDraft } = require("../models/AllocationWorkflow");
const { createSingle, createBulk, updateSlot, requireLegacyStaging } = require("../services/assignmentService");

async function createAssignment(req, res) {
  res.status(201).json({ success: true, data: await createSingle(req.body) });
}

async function createBulkAssignments(req, res) {
  const { cycleId, assignments } = req.body;
  const data = await createBulk(cycleId, assignments);
  res.status(201).json({ success: true, count: data.length, data });
}

async function getAssignments(req, res) {
  const cycles = await ParkingCycle.find().select("status activePublicationId latestPublicationId");
  const data = await ParkingAssignment.find({ $or: cycles.length ? cycles.map(visibleAssignments) : [{ _id: null }] })
    .populate("cycleId", "cycleName").populate("slotId", "slotNumber")
    .populate("flatId", "flatNumber").populate("vehicleId", "vehicleNumber");
  res.json({ success: true, count: data.length, data });
}

async function resetAssignments(req, res) {
  await parkingWrite(async (session) => {
    const planned = await ParkingCycle.find({ status: "PLANNED", latestPublicationId: { $exists: false } })
      .select("_id").session(session);
    const withDrafts = await AllocationDraft.distinct("cycleId").session(session);
    const blocked = new Set(withDrafts.map(String));
    await ParkingAssignment.deleteMany({
      cycleId: { $in: planned.map((cycle) => cycle._id).filter((cycleId) => !blocked.has(String(cycleId))) },
      publicationId: { $exists: false },
    }, { session });
  });
  res.json({ success: true, message: "Unmanaged planned assignments cleared" });
}

async function updateAssignment(req, res) {
  const data = await updateSlot(req.params.id, req.body.slotId);
  res.json({ success: true, message: "Assignment updated successfully", data });
}

async function deleteAssignment(req, res) {
  await parkingWrite(async (session) => {
    const assignment = await ParkingAssignment.findById(req.params.id).session(session);
    if (!assignment) throw new ApiError(404, "Assignment not found.");
    await requireLegacyStaging(assignment.cycleId, session);
    await ParkingAssignment.deleteOne({ _id: assignment._id }, { session });
  });
  res.json({ success: true, message: "Assignment deleted successfully" });
}

module.exports = {
  createAssignment, createBulkAssignments, getAssignments, resetAssignments, updateAssignment, deleteAssignment,
};
