const ParkingCycle = require("../models/ParkingCycle");
const ParkingAssignment = require("../models/ParkingAssignment");

const cloneCycle = async (req, res) => {
  try {
    const { cycleId } = req.params;

    const {
      cycleName,
      startDate,
      endDate,
      durationDays,
    } = req.body;

    // Check source cycle exists
    const sourceCycle =
      await ParkingCycle.findById(cycleId);

    if (!sourceCycle) {
      return res.status(404).json({
        success: false,
        message: "Source cycle not found",
      });
    }

    // Check duplicate cycle name
    const existingCycle =
      await ParkingCycle.findOne({
        cycleName,
      });

    if (existingCycle) {
      return res.status(400).json({
        success: false,
        message: "Cycle name already exists",
      });
    }

    // Create new cycle
    const newCycle =
      await ParkingCycle.create({
        cycleName,
        startDate,
        endDate,
        durationDays,
        status: "PLANNED",
      });

    // Fetch source assignments
    const sourceAssignments =
      await ParkingAssignment.find({
        cycleId,
        assignmentStatus: "ACTIVE",
      });

    // Clone assignments
    const clonedAssignments =
      sourceAssignments.map(
        (assignment) => ({
          cycleId: newCycle._id,
          slotId: assignment.slotId,
          flatId: assignment.flatId,
          vehicleId: assignment.vehicleId,
          assignmentStatus: "ACTIVE",
          parkingType:
            assignment.parkingType,
          notes: assignment.notes,
        })
      );

    await ParkingAssignment.insertMany(
      clonedAssignments
    );

    res.status(201).json({
      success: true,
      message:
        "Cycle cloned successfully",
      sourceCycle:
        sourceCycle.cycleName,
      newCycle,
      assignmentsCopied:
        clonedAssignments.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  cloneCycle,
};