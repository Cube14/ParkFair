const User = require("../models/User");
const Flat = require("../models/Flat");
const Vehicle = require("../models/Vehicle");
const ParkingAssignment = require("../models/ParkingAssignment");
const ParkingCycle = require("../models/ParkingCycle");
const ParkingSlot = require("../models/ParkingSlot");

exports.getResidentDashboard = async (req, res) => {
  try {
    //-------------------------------------------------
    // Logged in user
    //-------------------------------------------------

    const user = await User.findById(req.user.id).populate("flatId");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.flatId) {
      return res.status(404).json({
        success: false,
        message: "Resident has no flat assigned.",
      });
    }

    //-------------------------------------------------
    // Flat
    //-------------------------------------------------

    const flat = await Flat.findById(user.flatId);

    //-------------------------------------------------
    // Vehicle
    //-------------------------------------------------

    const vehicle = await Vehicle.findOne({
      flatId: flat._id,
      isActive: true,
    });

    //-------------------------------------------------
    // Active Assignment
    //-------------------------------------------------

    const assignment =
      await ParkingAssignment.findOne({
        flatId: flat._id,
        assignmentStatus: "ACTIVE",
      })
        .populate("slotId")
        .populate("cycleId");

    //-------------------------------------------------
    // Slot
    //-------------------------------------------------

    let slot = null;

    if (assignment) {
      slot = assignment.slotId;
    }

    //-------------------------------------------------
    // Cycle
    //-------------------------------------------------

    let cycle = null;

    if (assignment) {
      cycle = assignment.cycleId;
    }

    //-------------------------------------------------
    // Remaining Days
    //-------------------------------------------------

    let remainingDays = 0;

    if (cycle) {
      remainingDays = Math.max(
        0,
        Math.ceil(
          (new Date(cycle.endDate) - new Date()) /
            (1000 * 60 * 60 * 24)
        )
      );
    }

    //-------------------------------------------------
    // Response
    //-------------------------------------------------

    res.json({
      success: true,

      resident: {
        name: flat.ownerName,
        flatNumber: flat.flatNumber,
      },

      vehicle: vehicle
        ? {
            id: vehicle._id,
            number: vehicle.vehicleNumber,
            type: vehicle.vehicleType,
          }
        : null,

      parking: assignment
        ? {
            status: assignment.parkingType,
            slot: slot?.slotNumber || "N/A",
            side: slot?.side || "",
          }
        : null,

      cycle: cycle
        ? {
            id: cycle._id,
            name: cycle.cycleName,
            startDate: cycle.startDate,
            endDate: cycle.endDate,
            remainingDays,
          }
        : null,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};