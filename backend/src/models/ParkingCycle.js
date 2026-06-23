const mongoose = require("mongoose");

const parkingCycleSchema = new mongoose.Schema(
  {
    cycleName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    durationDays: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "PLANNED",
        "ACTIVE",
        "COMPLETED",
      ],
      default: "PLANNED",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ParkingCycle",
  parkingCycleSchema
);