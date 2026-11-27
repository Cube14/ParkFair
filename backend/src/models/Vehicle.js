const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    size: { type: String, enum: ["SMALL", "BIG"] },
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    vehicleType: {
        type: String,
        enum: ["CAR", "BIKE", "OTHER"],
        default: "CAR",
    },

    flatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      required: true,
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

module.exports = mongoose.model("Vehicle", vehicleSchema);
