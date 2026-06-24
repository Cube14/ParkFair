const ParkingAssignment = require(
  "../models/ParkingAssignment"
);
const ParkingSlot = require("../models/ParkingSlot");
const Flat = require("../models/Flat");
const Vehicle = require("../models/Vehicle");
const createAssignment = async (
  req,
  res
) => {
  try {
    const slot =
        await ParkingSlot.findById(
            req.body.slotId
        );

    const currentAssignments =
        await ParkingAssignment.countDocuments({
            cycleId: req.body.cycleId,
            slotId: req.body.slotId,
            assignmentStatus: "ACTIVE",
        });

    if (
        currentAssignments >=
        slot.maxCapacity
    ) {
        return res.status(400).json({
            success: false,
            message: `Slot ${slot.slotNumber} is already full`,
        });
    }

// Check flat already assigned

    const existingFlatAssignment =
        await ParkingAssignment.findOne({
            cycleId: req.body.cycleId,
            flatId: req.body.flatId,
            assignmentStatus: "ACTIVE",
    });

    if (existingFlatAssignment) {
        return res.status(400).json({
         success: false,
         message:
            "Flat already assigned in this cycle",
        });
    }
    const assignment =
      await ParkingAssignment.create(
        req.body
      );

    res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAssignments = async (
  req,
  res
) => {
  try {
    const assignments =
      await ParkingAssignment.find()
        .populate(
          "cycleId",
          "cycleName"
        )
        .populate(
          "slotId",
          "slotNumber"
        )
        .populate(
          "flatId",
          "flatNumber"
        )
        .populate(
          "vehicleId",
          "vehicleNumber"
        );

    res.status(200).json({
      success: true,
      count:
        assignments.length,
      data: assignments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createBulkAssignments = async (
  req,
  res
) => {
  try {
    const { cycleId, assignments } = req.body;

    const createdAssignments = [];

    for (const item of assignments) {
      const slot = await ParkingSlot.findOne({
        slotNumber: item.slotNumber,
      });

      const flat = await Flat.findOne({
        flatNumber: item.flatNumber,
      });

      if (!slot) {
        throw new Error(
          `Slot ${item.slotNumber} not found`
        );
      }

      if (!flat) {
        throw new Error(
          `Flat ${item.flatNumber} not found`
        );
      }

      const vehicle =
        await Vehicle.findOne({
          flatId: flat._id,
          isActive: true,
        });

      if (!vehicle) {
        throw new Error(
          `No active vehicle found for Flat ${item.flatNumber}`
        );
      }

      const currentAssignments =
        await ParkingAssignment.countDocuments({
          cycleId,
          slotId: slot._id,
          assignmentStatus: "ACTIVE",
        });
      if (currentAssignments >= slot.maxCapacity) {
        throw new Error(
          `Slot ${slot.slotNumber} is full`
        );
      }
      const existingFlatAssignment =
        await ParkingAssignment.findOne({
          cycleId,
          flatId: flat._id,
          assignmentStatus: "ACTIVE",
        });
      if (existingFlatAssignment) {
        throw new Error(
          `Flat ${flat.flatNumber} is already assigned in this cycle`
        );
      }
      const assignment =
        await ParkingAssignment.create({
          cycleId,
          slotId: slot._id,
          flatId: flat._id,
          vehicleId: vehicle._id,
          parkingType:
            item.slotNumber === "OUTSIDE"
              ? "OUTSIDE"
              : "INSIDE",
        });

      createdAssignments.push(
        assignment
      );
    }

    res.status(201).json({
      success: true,
      count: createdAssignments.length,
      data: createdAssignments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const resetAssignments = async (req, res) => {
  try {
    await ParkingAssignment.deleteMany({});

    res.status(200).json({
      success: true,
      message: "All assignments deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const updateAssignment = async (
  req,
  res
) => {
  try {
    const assignment =
      await ParkingAssignment.findById(
        req.params.id
      );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const newSlot =
      await ParkingSlot.findById(
        req.body.slotId
      );

    if (!newSlot) {
      return res.status(404).json({
        success: false,
        message: "Slot not found",
      });
    }

    const currentAssignments =
      await ParkingAssignment.countDocuments({
        cycleId: assignment.cycleId,
        slotId: newSlot._id,
        assignmentStatus: "ACTIVE",
        _id: { $ne: assignment._id },
      });

    if (
      currentAssignments >=
      newSlot.maxCapacity
    ) {
      return res.status(400).json({
        success: false,
        message: `Slot ${newSlot.slotNumber} is full`,
      });
    }

    assignment.slotId = newSlot._id;

    assignment.parkingType =
      newSlot.slotNumber === "OUTSIDE"
        ? "OUTSIDE"
        : "INSIDE";

    await assignment.save();

    res.status(200).json({
      success: true,
      message:
        "Assignment updated successfully",
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteAssignment = async (
  req,
  res
) => {
  try {
    const assignment =
      await ParkingAssignment.findByIdAndDelete(
        req.params.id
      );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Assignment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



module.exports = {
  createAssignment,
  getAssignments,
  createBulkAssignments,
  resetAssignments,
  updateAssignment,
  deleteAssignment,
};

