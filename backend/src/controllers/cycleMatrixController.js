const { visibleAssignments, realAssignmentFilter } = require("../services/assignmentVisibility");
const ParkingCycle = require("../models/ParkingCycle");
const ParkingAssignment = require("../models/ParkingAssignment");
const ParkingSlot = require("../models/ParkingSlot");
const { ApiError } = require("../middleware/apiErrors");
const { capacityFor } = require("../services/siddhaParking");

async function getCycleMatrix(req, res) {
  const cycleId = req.params.cycleId;
  const cycle = await ParkingCycle.findById(cycleId);
  if (!cycle) throw new ApiError(404, "Cycle not found.");

  const [slots, assignments] = await Promise.all([
    ParkingSlot.find(),
    ParkingAssignment.find({ ...visibleAssignments(cycle), ...await realAssignmentFilter(), assignmentStatus: "ACTIVE" })
      .populate("flatId", "flatNumber").populate("slotId", "slotNumber"),
  ]);
  const slotCapacity = new Map();
  for (const [physical, group] of capacityFor(slots, assignments).groups) {
    const label = group.type === "OUTSIDE" ? "OUTSIDE" : physical;
    slotCapacity.set(label, (slotCapacity.get(label) ?? 0) + group.total);
  }

  const grouped = new Map(Array.from(slotCapacity.keys(), (label) => [label, []]));
  for (const { slotId: slot, flatId: flat, parkingType, physicalSlotNumber } of assignments) {
    if (!slot || !flat) continue;
    const label = parkingType === "OUTSIDE" ? "OUTSIDE" : physicalSlotNumber ?? slot.slotNumber;
    if (!grouped.has(label)) grouped.set(label, []);
    grouped.get(label).push(flat.flatNumber);
  }

  res.json({
    success: true, cycle: cycle.cycleName,
    data: Object.fromEntries(grouped),
    capacity: Object.fromEntries(slotCapacity),
  });
}

module.exports = { getCycleMatrix };
