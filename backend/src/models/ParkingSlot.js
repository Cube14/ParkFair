const mongoose = require("mongoose");

const parkingSlotSchema = new mongoose.Schema(
  {
    domain: { type: String, enum: ["SIDDHA_A"] },
    physicalSlotNumber: String,
    physicalSlotId: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingSlot" },
    position: { type: String, enum: ["FULL", "A", "B", "SINGLE", "TEST"] },
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
