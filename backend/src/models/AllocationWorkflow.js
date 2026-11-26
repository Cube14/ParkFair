const { Schema, model } = require("mongoose");
const objectId = Schema.Types.ObjectId;
const reference = (ref) => ({ type: objectId, ref, required: true });
const options = { timestamps: true, versionKey: false };
const sourceRow = new Schema({
  row: { type: Number, required: true },
  flatNumber: String, slotNumber: String, vehicleNumber: String, notes: String,
}, { _id: false });
const issue = new Schema({
  row: Number, field: String, code: String, message: String,
}, { _id: false });

const draftSchema = new Schema({
  cycleId: reference("ParkingCycle"),
  revision: { type: Number, required: true },
  status: { type: String, enum: ["DRAFT", "VALIDATED", "APPROVED", "PUBLISHED", "CANCELLED"], required: true },
  issues: [issue],
  approvedBy: { type: objectId, ref: "User" },
  approvedAt: Date,
  validatedDigest: String,
  approvedDigest: String,
  publicationId: { type: objectId, ref: "AllocationPublication" },
}, options);
draftSchema.index({ cycleId: 1, updatedAt: -1 });

const revisionSchema = new Schema({
  draftId: reference("AllocationDraft"),
  revision: { type: Number, required: true },
  actorId: reference("User"),
  source: { type: String, enum: ["MANUAL", "CSV", "XLSX", "LEGACY"], required: true },
  rows: [sourceRow],
  importIssues: [issue],
}, options);
revisionSchema.index({ draftId: 1, revision: 1 }, { unique: true });

const publicationSchema = new Schema({
  draftId: reference("AllocationDraft"),
  cycleId: reference("ParkingCycle"),
  revision: { type: Number, required: true },
  sequence: { type: Number, required: true },
  key: { type: String, required: true },
  actorId: reference("User"),
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  rowCount: { type: Number, required: true },
  activatedAt: Date,
}, options);
publicationSchema.index({ draftId: 1, revision: 1 }, { unique: true });
publicationSchema.index({ key: 1 }, { unique: true });
publicationSchema.index({ cycleId: 1, sequence: 1 }, { unique: true });

const auditSchema = new Schema({
  actorId: reference("User"),
  action: { type: String, required: true },
  entityId: { type: objectId, required: true },
  revision: Number,
  counts: {
    rows: Number,
    errors: Number,
    jobs: Number,
    sessions: Number,
  },
  reason: { type: String, enum: ["LOGOUT", "OWNER_REVOKED", "REPLAY", "ACCOUNT_CHANGED"] },
}, options);
auditSchema.index({ entityId: 1, createdAt: -1, _id: -1 });

const outboxSchema = new Schema({
  eventId: { type: String, required: true },
  publicationId: reference("AllocationPublication"),
  flatId: reference("Flat"),
  channel: { type: String, enum: ["PARKING_ALLOCATION"], required: true },
  state: { type: String, enum: ["PENDING", "CLAIMED", "DELIVERED", "RETRY", "AMBIGUOUS", "FAILED"], default: "PENDING" },
  attempts: { type: Number, default: 0 },
  nextAttemptAt: { type: Date, required: true },
  leaseUntil: Date,
  claim: String,
  providerResult: { type: String, enum: ["ACCEPTED", "RETRYABLE", "UNKNOWN", "REJECTED"] },
}, options);
outboxSchema.index({ eventId: 1 }, { unique: true });
outboxSchema.index({ state: 1, nextAttemptAt: 1 });

const fenceSchema = new Schema({ _id: String, version: Number }, { versionKey: false });

module.exports = {
  AllocationDraft: model("AllocationDraft", draftSchema),
  AllocationRevision: model("AllocationRevision", revisionSchema),
  AllocationPublication: model("AllocationPublication", publicationSchema),
  AdminAudit: model("AdminAudit", auditSchema),
  NotificationOutbox: model("NotificationOutbox", outboxSchema),
  ParkingWriteFence: model("ParkingWriteFence", fenceSchema),
};
