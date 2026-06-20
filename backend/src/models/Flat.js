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
      default: "",
      trim: true,
    },

    contactNumber: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
      lowercase: true,
    },

    wing: {
      type: String,
      default: "A",
    },

    floor: {
      type: Number,
      default: 1,
    },

    isRegistered: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["RESIDENT", "ADMIN", "SUPER_ADMIN"],
      default: "RESIDENT",
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