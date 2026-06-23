const mongoose = require("mongoose");

const creditLedgerSchema = new mongoose.Schema(
  {
    flatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flat",
      required: true,
      unique: true,
    },

    insideRotations: {
      type: Number,
      default: 0,
      min: 0,
    },

    outsideRotations: {
      type: Number,
      default: 0,
      min: 0,
    },

    balanceScore: {
      type: Number,
      default: 0,
    },

    lastReason: {
      type: String,
      default: "Initial",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "CreditLedger",
  creditLedgerSchema
);