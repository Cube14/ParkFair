const ParkingCycle = require(
  "../models/ParkingCycle"
);

const ParkingAssignment = require(
  "../models/ParkingAssignment"
);

const getCycleMatrix = async (
  req,
  res
) => {
  try {
    const { cycleId } = req.params;

    const cycle =
      await ParkingCycle.findById(
        cycleId
      );

    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: "Cycle not found",
      });
    }

    const assignments =
      await ParkingAssignment.find({
        cycleId,
        assignmentStatus: "ACTIVE",
      })
        .populate(
          "flatId",
          "flatNumber"
        )
        .populate(
          "slotId",
          "slotNumber"
        );

    const matrix = {
      "1": [],
      "2": [],
      "3": [],
      "4": [],
      "5": [],
      "6": [],
      "7": [],
      "8": [],
      OUTSIDE: [],
    };

    assignments.forEach(
      (assignment) => {
        const slot =
          assignment.slotId.slotNumber;

        const flat =
          assignment.flatId.flatNumber;

        if (matrix[slot]) {
          matrix[slot].push(flat);
        }
      }
    );

    res.status(200).json({
      success: true,
      cycle: cycle.cycleName,
      data: matrix,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCycleMatrix,
};