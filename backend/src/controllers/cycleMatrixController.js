const ParkingCycle = require("../models/ParkingCycle");
const ParkingAssignment = require("../models/ParkingAssignment");
const ParkingSlot = require("../models/ParkingSlot");
const { ApiError } = require("../middleware/apiErrors");
const { parkingTypeFor } = require("../services/assignmentService");

async function getCycleMatrix(req, res) {
  const cycleId = req.params.cycleId;
  const cycle = await ParkingCycle.findById(cycleId);
  if (!cycle) throw new ApiError(404, "Cycle not found.");

  const [slots, assignments] = await Promise.all([
    ParkingSlot.find({ isActive: true }),
    ParkingAssignment.find({ cycleId, assignmentStatus: "ACTIVE" })
      .populate("flatId", "flatNumber").populate("slotId", "slotNumber"),
  ]);
  const slotCapacity = new Map();
  for (const slot of slots) {
    const label = parkingTypeFor(slot) === "OUTSIDE" ? "OUTSIDE" : slot.slotNumber;
    slotCapacity.set(label, (slotCapacity.get(label) ?? 0) + slot.maxCapacity);
  }

  const grouped = new Map(Array.from(slotCapacity.keys(), (label) => [label, []]));
  for (const { slotId: slot, flatId: flat, parkingType } of assignments) {
    if (!slot || !flat) continue;
    const label = parkingType === "OUTSIDE" ? "OUTSIDE" : slot.slotNumber;
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
