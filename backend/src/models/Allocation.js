const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema(
  {
    flatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      required: true,
    },

    rotationNumber: {
      type: Number,
      required: true,
    },

    parkingType: {
      type: String,
      enum: ["INSIDE", "OUTSIDE"],
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Allocation",
  allocationSchema
);