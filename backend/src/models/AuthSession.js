const { Schema, model } = require("mongoose");

const sessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  client: { type: String, enum: ["web", "native"], required: true },
  accountVersion: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
  lastUsedAt: Date,
  revokedAt: Date,
}, { timestamps: true, versionKey: false });
sessionSchema.index({ userId: 1, revokedAt: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const tokenSchema = new Schema({
  _id: String,
  sessionId: { type: Schema.Types.ObjectId, ref: "AuthSession", required: true },
  expiresAt: { type: Date, required: true },
  usedAt: Date,
}, { versionKey: false });
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = { AuthSession: model("AuthSession", sessionSchema), RefreshToken: model("RefreshToken", tokenSchema) };
