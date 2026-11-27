const ParkingCycle = require("../models/ParkingCycle");
const { visibleAssignments, realAssignmentFilter } = require("../services/assignmentVisibility");
const { ApiError } = require("../middleware/apiErrors");
const ParkingAssignment = require("../models/ParkingAssignment");

async function getCycleLayout(req, res) {
  const cycle = await ParkingCycle.findById(req.params.cycleId);
  if (!cycle) throw new ApiError(404, "Cycle not found.");
  const assignments = await ParkingAssignment.find({
    ...visibleAssignments(cycle),
    ...await realAssignmentFilter(),
    assignmentStatus: "ACTIVE",
  }).populate("slotId", "slotNumber").populate("flatId", "flatNumber");

  const slots = new Map(Array.from({ length: 8 }, (_, i) => [String(i + 1), []]));
  const outside = [];
  for (const { slotId: slot, flatId: flat, parkingType } of assignments) {
    if (!slot || !flat) continue;
    if (parkingType === "OUTSIDE" || slot.slotNumber === "OUTSIDE") {
      outside.push(flat.flatNumber);
    } else {
      if (!slots.has(slot.slotNumber)) slots.set(slot.slotNumber, []);
      slots.get(slot.slotNumber).push(flat.flatNumber);
    }
  }
  res.json({ success: true, data: { slots: Object.fromEntries(slots), outside } });
}
module.exports = { getCycleLayout };
