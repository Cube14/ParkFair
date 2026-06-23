const mongoose = require("mongoose");

const rotationSchema = new mongoose.Schema(
  {
    rotationNumber: {
      type: Number,
      required: true,
      unique: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    generated: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Rotation",
  rotationSchema
);