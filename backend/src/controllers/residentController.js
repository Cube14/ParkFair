const Flat = require("../models/Flat");
const Vehicle = require("../models/Vehicle");
const ParkingAssignment = require("../models/ParkingAssignment");
const { currentCycle, remainingDays } = require("../services/cycleSelection");
const { ApiError } = require("../middleware/apiErrors");

exports.getResidentDashboard = async (req, res) => {
  const flat = req.user.flatId && await Flat.findById(req.user.flatId);
  if (!flat) throw new ApiError(404, "Resident has no flat assigned.");

  const cycle = await currentCycle();
  const assignment = cycle && await ParkingAssignment.findOne({
    flatId: flat._id,
    cycleId: cycle._id,
    assignmentStatus: "ACTIVE",
  }).sort({ createdAt: 1, _id: 1 }).populate("slotId").populate({
    path: "vehicleId",
    match: { flatId: flat._id },
  });
  const vehicle = assignment?.vehicleId ?? await Vehicle.findOne({
    flatId: flat._id,
    isActive: true,
  }).sort({ createdAt: 1, _id: 1 });

  res.json({
    success: true,
    resident: { name: flat.ownerName, flatNumber: flat.flatNumber },
    vehicle: vehicle ? { id: vehicle._id, number: vehicle.vehicleNumber, type: vehicle.vehicleType } : null,
    parking: assignment ? {
      status: assignment.parkingType,
      slot: assignment.slotId?.slotNumber || "N/A",
      side: assignment.slotId?.side || "",
    } : null,
    cycle: cycle ? {
      id: cycle._id,
      name: cycle.cycleName,
      startDate: cycle.startDate,
      endDate: cycle.endDate,
      remainingDays: remainingDays(cycle.endDate),
    } : null,
  });
};
