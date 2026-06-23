// layoutController.js

const ParkingAssignment = require(
  "../models/ParkingAssignment"
);

const getCycleLayout = async (
  req,
  res
) => {
  try {
    const { cycleId } = req.params;

    const assignments =
      await ParkingAssignment.find({
        cycleId,
        assignmentStatus: "ACTIVE",
      })
        .populate(
          "slotId",
          "slotNumber"
        )
        .populate(
          "flatId",
          "flatNumber"
        );

    const layout = {
      slots: {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: [],
        8: [],
      },

      outside: [],
    };

    assignments.forEach(
      (assignment) => {
        const slotNumber =
          assignment.slotId.slotNumber;

        const flatNumber =
          assignment.flatId.flatNumber;

        if (
          slotNumber === "OUTSIDE"
        ) {
          layout.outside.push(
            flatNumber
          );
        } else {
          layout.slots[
            slotNumber
          ].push(flatNumber);
        }
      }
    );

    res.status(200).json({
      success: true,
      data: layout,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCycleLayout,
};