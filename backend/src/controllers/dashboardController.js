const { visibleAssignments, realAssignmentFilter } = require("../services/assignmentVisibility");
const { capacityFor } = require("../services/siddhaParking");
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
    ParkingSlot.find().lean(),
    ParkingCycle.countDocuments(),
    currentCycle(),
  ]);

  const real = await realAssignmentFilter();
  const assignments = activeCycle ? await ParkingAssignment.find({ ...visibleAssignments(activeCycle), ...real, assignmentStatus: "ACTIVE" })
    .select("slotId parkingType").lean() : [];
  const capacity = capacityFor(slots, assignments);
  const maximum = capacityFor(slots, []).counts;
  const insideAssignments = capacity.counts.INSIDE.occupied;
  const outsideAssignments = capacity.counts.OUTSIDE.occupied;
  const recentFilter = [{ publicationId: { $exists: false } }];
  if (activeCycle?.activePublicationId) recentFilter.push(visibleAssignments(activeCycle));
  const recentAssignments = await ParkingAssignment.find({ $or: recentFilter, ...real })
    .populate("flatId", "flatNumber").populate("slotId", "slotNumber")
    .sort({ createdAt: -1, _id: -1 }).limit(5);
  const occupied = insideAssignments + outsideAssignments;
  const totalCapacity = capacity.counts.INSIDE.total + capacity.counts.OUTSIDE.total;

  res.json({
    success: true,
    data: {
      totalFlats, totalVehicles, totalSlots: capacity.groups.size, totalCycles,
      ...(capacity.managed && { capacityByArea: capacity.counts, maximumCapacity: maximum.INSIDE.total + maximum.OUTSIDE.total }),
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
