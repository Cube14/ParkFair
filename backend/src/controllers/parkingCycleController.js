const ParkingCycle = require("../models/ParkingCycle");
const ParkingAssignment = require("../models/ParkingAssignment");
const { withCycleWrite } = require("../services/assignmentService");
const { ApiError } = require("../middleware/apiErrors");

async function createCycle(req, res) {
  const data = await ParkingCycle.create(req.body);
  res.status(201).json({ success: true, data });
}

async function getCycles(req, res) {
  const data = await ParkingCycle.find().sort({ startDate: 1 });
  res.json({ success: true, count: data.length, data });
}

async function updateCycleStatus(req, res) {
  const { status } = req.body;
  const cycleId = req.params.id;
  const data = await withCycleWrite(cycleId, async (session) => {
    if (status === "ACTIVE") {
      await ParkingCycle.updateMany(
        { _id: { $ne: cycleId }, status: "ACTIVE" }, { status: "COMPLETED" }, { session }
      );
    }
    return ParkingCycle.findByIdAndUpdate(cycleId, { status }, { session, returnDocument: "after" });
  });
  res.json({ success: true, message: "Cycle status updated", data });
}

async function completeCycle(req, res) {
  const data = await ParkingCycle.findByIdAndUpdate(
    req.params.id, { status: "COMPLETED" }, { returnDocument: "after" }
  );
  if (!data) throw new ApiError(404, "Cycle not found.");
  res.json({ success: true, message: "Cycle completed successfully", data });
}

async function deleteCycle(req, res) {
  const cycleId = req.params.id;
  await withCycleWrite(cycleId, async (session) => {
    if (await ParkingAssignment.exists({ cycleId }).session(session)) {
      throw new ApiError(409, "A cycle with parking history cannot be deleted.");
    }
    await ParkingCycle.deleteOne({ _id: cycleId }, { session });
  });
  res.json({ success: true, message: "Cycle deleted" });
}
module.exports = { createCycle, getCycles, deleteCycle, updateCycleStatus, completeCycle };
