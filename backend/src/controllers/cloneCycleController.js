const { visibleAssignments } = require("../services/assignmentVisibility");
const ParkingCycle = require("../models/ParkingCycle");
const ParkingAssignment = require("../models/ParkingAssignment");
const { withCycleWrite, insertAssignment } = require("../services/assignmentService");

async function cloneCycle(req, res) {
  const { cycleId } = req.params;
  const { cycleName, startDate, endDate, durationDays } = req.body;
  const result = await withCycleWrite(cycleId, async (session) => {
    const sourceCycle = await ParkingCycle.findById(cycleId).session(session);
    const assignments = await ParkingAssignment.find({ ...visibleAssignments(sourceCycle), assignmentStatus: "ACTIVE" })
      .populate("slotId vehicleId").session(session);
    const [newCycle] = await ParkingCycle.create([
      { cycleName, startDate, endDate, durationDays, status: "PLANNED" },
    ], { session });
    for (const assignment of assignments) await insertAssignment({ cycleId: newCycle._id,
      slot: assignment.slotId, flatId: assignment.flatId, vehicle: assignment.vehicleId, notes: assignment.notes }, session);
    return { sourceCycle: sourceCycle.cycleName, newCycle, assignmentsCopied: assignments.length };
  });
  res.status(201).json({ success: true, message: "Cycle cloned successfully", ...result });
}
module.exports = { cloneCycle };
