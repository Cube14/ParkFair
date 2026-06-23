const ParkingCycle = require(
  "../models/ParkingCycle"
);

const ParkingAssignment = require(
  "../models/ParkingAssignment"
);

const getCycleSummary = async (
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

    const insideFlats = [];
    const outsideFlats = [];

    assignments.forEach(
      (assignment) => {
        if (
          assignment.parkingType ===
          "INSIDE"
        ) {
          insideFlats.push(
            assignment.flatId.flatNumber
          );
        } else {
          outsideFlats.push(
            assignment.flatId.flatNumber
          );
        }
      }
    );

    const totalAssignments =
      assignments.length;

    const insideCount =
      insideFlats.length;

    const outsideCount =
      outsideFlats.length;

    const occupancyPercentage =
      ((insideCount / 8) * 100).toFixed(
        2
      );

    res.status(200).json({
      success: true,

      data: {
        cycleName:
          cycle.cycleName,

        startDate:
          cycle.startDate,

        endDate:
          cycle.endDate,

        status: cycle.status,

        totalAssignments,

        insideCount,

        outsideCount,

        occupancyPercentage,

        insideFlats,

        outsideFlats,
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
  getCycleSummary,
};