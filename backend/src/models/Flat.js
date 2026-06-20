const mongoose = require("mongoose");

const flatSchema = new mongoose.Schema(
  {
    flatNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    ownerName: {
      type: String,
      required: true,
      trim: true,
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

module.exports = mongoose.model("Flat", flatSchema);