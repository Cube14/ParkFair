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

    const insideAssignments =
      await ParkingAssignment.countDocuments({
        parkingType: "INSIDE",
        assignmentStatus: "ACTIVE",
      });

    const outsideAssignments =
      await ParkingAssignment.countDocuments({
        parkingType: "OUTSIDE",
        assignmentStatus: "ACTIVE",
      });

    const totalCapacity =
      (
        await ParkingSlot.find({
          isActive: true,
        })
      ).reduce(
        (sum, slot) =>
          sum + slot.maxCapacity,
        0
      );

    const occupancyPercentage =
      totalCapacity > 0
        ? Math.round(
            ((insideAssignments +
              outsideAssignments) /
              totalCapacity) *
              100
          )
        : 0;

    const recentAssignments =
      await ParkingAssignment.find()
        .populate(
          "flatId",
          "flatNumber"
        )
        .populate(
          "slotId",
          "slotNumber"
        )
        .sort({
          createdAt: -1,
        })
        .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalFlats,
        totalVehicles,
        totalSlots,
        totalCycles,

        activeCycle:
          activeCycle?.cycleName ||
          null,

        activeCycleAssignments,

        activeCycleStartDate:
          activeCycle?.startDate ||
          null,

        activeCycleEndDate:
          activeCycle?.endDate ||
          null,

        activeCycleStatus:
          activeCycle?.status ||
          null,

        insideAssignments,
        outsideAssignments,

        totalCapacity,

        availableCapacity:
          totalCapacity -
          (insideAssignments +
            outsideAssignments),

        occupancyPercentage,

        recentAssignments,
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