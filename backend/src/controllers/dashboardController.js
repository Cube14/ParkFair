const Flat = require("../models/Flat");
const Vehicle = require("../models/Vehicle");
const ParkingSlot = require("../models/ParkingSlot");
const ParkingCycle = require("../models/ParkingCycle");
const ParkingAssignment = require("../models/ParkingAssignment");

const getDashboardData = async (
  req,
  res
) => {
  try {
    const totalFlats =
      await Flat.countDocuments();

    const totalVehicles =
      await Vehicle.countDocuments({
        isActive: true,
      });

    const totalSlots =
      await ParkingSlot.countDocuments({
        isActive: true,
      });

    const totalCycles =
      await ParkingCycle.countDocuments();

    const activeCycle =
      await ParkingCycle.findOne({
        status: "ACTIVE",
      });

    let activeCycleAssignments = 0;

    if (activeCycle) {
      activeCycleAssignments =
        await ParkingAssignment.countDocuments({
          cycleId: activeCycle._id,
          assignmentStatus: "ACTIVE",
        });
    }

    res.status(200).json({
      success: true,
      data: {
        totalFlats,
        totalVehicles,
        totalSlots,
        totalCycles,

        activeCycle:
          activeCycle?.cycleName || null,

        activeCycleAssignments,

        activeCycleStartDate:
          activeCycle?.startDate || null,

        activeCycleEndDate:
          activeCycle?.endDate || null,

        activeCycleStatus:
          activeCycle?.status || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardData,
};