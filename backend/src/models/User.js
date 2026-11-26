const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      select: false,
      required: true,
    },

    role: {
      type: String,
      enum: ["ADMIN", "RESIDENT"],
      default: "RESIDENT",
    },

    flatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    sessionVersion: { type: Number, default: 0, select: false },

    mustChangePassword: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
    toJSON: { transform: (doc, value) => { delete value.password; delete value.sessionVersion; } },
  }
);

module.exports = mongoose.model("User", userSchema);