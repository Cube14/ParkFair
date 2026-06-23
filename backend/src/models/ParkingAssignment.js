const mongoose = require("mongoose");

const parkingAssignmentSchema =
  new mongoose.Schema(
    {
      cycleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ParkingCycle",
        required: true,
      },

      slotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ParkingSlot",
        required: true,
      },

      flatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Flat",
        required: true,
      },

      vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true,
      },
      assignmentStatus: {
        type: String,
        enum: [
            "ACTIVE",
            "COMPLETED",
            "CANCELLED",
        ],
        default: "ACTIVE",
      },
      parkingType: {
        type: String,
        enum: [
          "INSIDE",
          "OUTSIDE",
        ],
        required: true,
      },

      notes: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "ParkingAssignment",
  parkingAssignmentSchema
);