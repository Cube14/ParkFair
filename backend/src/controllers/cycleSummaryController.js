const ParkingCycle = require("../models/ParkingCycle");
const ParkingAssignment = require("../models/ParkingAssignment");
const ParkingSlot = require("../models/ParkingSlot");
const { ApiError } = require("../middleware/apiErrors");
const { parkingTypeFor } = require("../services/assignmentService");

async function getCycleSummary(req, res) {
  const cycleId = req.params.cycleId;
  const cycle = await ParkingCycle.findById(cycleId);
  if (!cycle) throw new ApiError(404, "Cycle not found.");

  const [assignments, slots] = await Promise.all([
    ParkingAssignment.find({ cycleId, assignmentStatus: "ACTIVE" }).populate("flatId", "flatNumber"),
    ParkingSlot.find({ isActive: true }),
  ]);
  const inside = assignments.filter((assignment) => assignment.parkingType === "INSIDE");
  const outside = assignments.filter((assignment) => assignment.parkingType === "OUTSIDE");
  const capacity = slots.reduce((sum, slot) => parkingTypeFor(slot) === "INSIDE"
    ? sum + slot.maxCapacity : sum, 0);
  const flatNumbers = (group) => group.flatMap((assignment) => assignment.flatId ? [assignment.flatId.flatNumber] : []);

  res.json({
    success: true,
    data: {
      cycleName: cycle.cycleName, startDate: cycle.startDate, endDate: cycle.endDate, status: cycle.status,
      totalAssignments: assignments.length, insideCount: inside.length, outsideCount: outside.length,
      occupancyPercentage: (capacity ? inside.length / capacity * 100 : 0).toFixed(2),
      insideFlats: flatNumbers(inside), outsideFlats: flatNumbers(outside),
    },
  });
}

module.exports = { getCycleSummary };
