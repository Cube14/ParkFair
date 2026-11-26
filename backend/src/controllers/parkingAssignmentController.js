const ParkingAssignment = require("../models/ParkingAssignment");
const { ApiError } = require("../middleware/apiErrors");
const { createSingle, createBulk, updateSlot } = require("../services/assignmentService");

async function createAssignment(req, res) {
  res.status(201).json({ success: true, data: await createSingle(req.body) });
}

async function createBulkAssignments(req, res) {
  const { cycleId, assignments } = req.body;
  const data = await createBulk(cycleId, assignments);
  res.status(201).json({ success: true, count: data.length, data });
}

async function getAssignments(req, res) {
  const data = await ParkingAssignment.find()
    .populate("cycleId", "cycleName").populate("slotId", "slotNumber")
    .populate("flatId", "flatNumber").populate("vehicleId", "vehicleNumber");
  res.json({ success: true, count: data.length, data });
}

async function resetAssignments(req, res) {
  await ParkingAssignment.deleteMany({});
  res.json({ success: true, message: "All assignments deleted" });
}

async function updateAssignment(req, res) {
  const data = await updateSlot(req.params.id, req.body.slotId);
  res.json({ success: true, message: "Assignment updated successfully", data });
}

async function deleteAssignment(req, res) {
  const assignment = await ParkingAssignment.findByIdAndDelete(req.params.id);
  if (!assignment) throw new ApiError(404, "Assignment not found.");
  res.json({ success: true, message: "Assignment deleted successfully" });
}

module.exports = {
  createAssignment, createBulkAssignments, getAssignments, resetAssignments, updateAssignment, deleteAssignment,
};
