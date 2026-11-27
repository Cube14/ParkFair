const mongoose = require("mongoose");

const parkingAssignmentSchema =
  new mongoose.Schema(
    {
      publicationId: { type: mongoose.Schema.Types.ObjectId, ref: "AllocationPublication" },
      flatNumber: String, slotNumber: String, slotSide: String, vehicleNumber: String, vehicleType: String,
      physicalSlotNumber: String,
      slotPosition: { type: String, enum: ["FULL", "A", "B", "SINGLE"] },
      vehicleSize: { type: String, enum: ["SMALL", "BIG"] },
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

parkingAssignmentSchema.index({ publicationId: 1, flatId: 1 }, {
  unique: true, partialFilterExpression: { publicationId: { $type: "objectId" } },
});
parkingAssignmentSchema.index({ publicationId: 1, vehicleId: 1 }, {
  unique: true, partialFilterExpression: { publicationId: { $type: "objectId" } },
});
parkingAssignmentSchema.index({ cycleId: 1, publicationId: 1, assignmentStatus: 1 });

module.exports = mongoose.model(
  "ParkingAssignment",
  parkingAssignmentSchema
);
