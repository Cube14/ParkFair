const { Schema, model } = require("mongoose");
const id = Schema.Types.ObjectId;
const schema = new Schema({
  cycleId: { type: id, required: true },
  publicationId: { type: id, required: true, unique: true },
  approvedBy: { type: id, required: true },
  approvedAt: { type: Date, required: true },
  dueAt: { type: Date, required: true },
  nextAttemptAt: { type: Date, required: true },
  status: { type: String, enum: ["PENDING", "RETRY", "ACTIVATED", "CANCELLED", "FAILED", "SUPERSEDED"], required: true },
  attempts: { type: Number, default: 0 },
  lastError: String,
  finishedAt: Date,
}, { timestamps: true });
schema.index({ status: 1, nextAttemptAt: 1 });
module.exports = model("ScheduledActivation", schema);
