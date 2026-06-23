const mongoose = require("mongoose");

const parkingSlotSchema = new mongoose.Schema(
  {
    slotNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    side: {
      type: String,
      enum: ["A", "B", "OUTSIDE"],
      required: true,
    },

    maxCapacity: {
      type: Number,
      required: true,
      default: 1,
    },
    displayOrder: {
      type: Number,
      required: true,
      
    },
    slotType: {
      type: String,
      enum: [
        "STANDARD",
        "DOUBLE",
        "OUTSIDE",
      ],
      default: "STANDARD",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ParkingSlot",
  parkingSlotSchema
);