const ParkingCycle = require("../models/ParkingCycle");
const ParkingAssignment = require("../models/ParkingAssignment");
const { withCycleWrite } = require("../services/assignmentService");

async function cloneCycle(req, res) {
  const { cycleId } = req.params;
  const { cycleName, startDate, endDate, durationDays } = req.body;
  const result = await withCycleWrite(cycleId, async (session) => {
    const sourceCycle = await ParkingCycle.findById(cycleId).session(session);
    const assignments = await ParkingAssignment.find({ cycleId, assignmentStatus: "ACTIVE" }).session(session);
    const [newCycle] = await ParkingCycle.create([
      { cycleName, startDate, endDate, durationDays, status: "PLANNED" },
    ], { session });
    if (assignments.length) {
      await ParkingAssignment.insertMany(assignments.map((assignment) => ({
        cycleId: newCycle._id, slotId: assignment.slotId, flatId: assignment.flatId,
        vehicleId: assignment.vehicleId, assignmentStatus: "ACTIVE",
        parkingType: assignment.parkingType, notes: assignment.notes,
      })), { session });
    }
    return { sourceCycle: sourceCycle.cycleName, newCycle, assignmentsCopied: assignments.length };
  });
  res.status(201).json({ success: true, message: "Cycle cloned successfully", ...result });
}
module.exports = { cloneCycle };
