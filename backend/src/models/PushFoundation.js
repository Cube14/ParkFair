const { Schema, model } = require("mongoose");
const id = Schema.Types.ObjectId;
const install = new Schema({
  installationId: { type: String, required: true, unique: true },
  userId: { type: id, required: true },
  sessionId: { type: id, required: true },
  platform: { type: String, enum: ["android", "ios"], required: true },
  digest: { type: String, required: true, select: false },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });
install.index({ sessionId: 1 });
install.index({ userId: 1 });
install.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const inbox = new Schema({
  eventId: { type: String, required: true },
  userId: { type: id, required: true },
  publicationId: { type: id, required: true },
  kind: { type: String, enum: ["PARKING_UPDATED"], required: true },
}, { timestamps: true });
inbox.index({ userId: 1, eventId: 1 }, { unique: true });
inbox.index({ userId: 1, createdAt: -1 });
module.exports = { PushInstallation: model("PushInstallation", install), ResidentInbox: model("ResidentInbox", inbox) };
