const { visibleAssignments } = require("../services/assignmentVisibility");
const Flat = require("../models/Flat");
const Vehicle = require("../models/Vehicle");
const ParkingSlot = require("../models/ParkingSlot");
const ParkingCycle = require("../models/ParkingCycle");
const ParkingAssignment = require("../models/ParkingAssignment");
const { currentCycle } = require("../services/cycleSelection");

async function getDashboardData(req, res) {
  const [totalFlats, totalVehicles, slots, totalCycles, activeCycle] = await Promise.all([
    Flat.countDocuments(),
    Vehicle.countDocuments({ isActive: true }),
    ParkingSlot.find({ isActive: true }).select("maxCapacity"),
    ParkingCycle.countDocuments(),
    currentCycle(),
  ]);

  const assignmentFilter = activeCycle && { ...visibleAssignments(activeCycle), assignmentStatus: "ACTIVE" };
  const [insideAssignments, outsideAssignments] = activeCycle ? await Promise.all([
    ParkingAssignment.countDocuments({ ...assignmentFilter, parkingType: "INSIDE" }),
    ParkingAssignment.countDocuments({ ...assignmentFilter, parkingType: "OUTSIDE" }),
  ]) : [0, 0];
  const recentFilter = [{ publicationId: { $exists: false } }];
  if (activeCycle?.activePublicationId) recentFilter.push(visibleAssignments(activeCycle));
  const recentAssignments = await ParkingAssignment.find({ $or: recentFilter })
    .populate("flatId", "flatNumber").populate("slotId", "slotNumber")
    .sort({ createdAt: -1, _id: -1 }).limit(5);
  const occupied = insideAssignments + outsideAssignments;
  const totalCapacity = slots.reduce((sum, slot) => sum + slot.maxCapacity, 0);

  res.json({
    success: true,
    data: {
      totalFlats, totalVehicles, totalSlots: slots.length, totalCycles,
      activeCycle: activeCycle?.cycleName ?? null,
      activeCycleAssignments: occupied,
      activeCycleStartDate: activeCycle?.startDate ?? null,
      activeCycleEndDate: activeCycle?.endDate ?? null,
      activeCycleStatus: activeCycle?.status ?? null,
      insideAssignments, outsideAssignments, totalCapacity,
      availableCapacity: totalCapacity - occupied,
      occupancyPercentage: totalCapacity > 0 ? Math.round(occupied / totalCapacity * 100) : 0,
      recentAssignments,
    },
  });
}
module.exports = { getDashboardData };
