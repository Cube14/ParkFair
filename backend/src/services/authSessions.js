const { PushInstallation } = require("../models/PushFoundation");
const { randomBytes, createHash } = require("node:crypto");
const jwt = require("jsonwebtoken");
const { connection } = require("mongoose");
const User = require("../models/User");
const { AuthSession, RefreshToken } = require("../models/AuthSession");
const { ApiError } = require("../middleware/apiErrors");
const { audit } = require("./parkingWrite");

const life = 30 * 86400000;
const digest = (token) => createHash("sha256").update(token).digest("hex");
const validToken = (token) => typeof token === "string" && /^[a-zA-Z0-9_-]{43}$/.test(token);
const denied = () => new ApiError(401, "Sign-in required.");

function accessToken(user, sessionId) {
  return jwt.sign({
    id: user._id, role: user.role, version: user.sessionVersion ?? 0, ...(sessionId && { sid: sessionId }),
  }, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "15m" });
}

function lockAccount(id, session) {
  return User.findOneAndUpdate({ _id: id }, { $inc: { sessionFence: 1 } }, {
    session, returnDocument: "after", timestamps: false,
  }).select("+sessionVersion").populate("flatId", "flatNumber ownerName");
}

async function mint(family, session) {
  const value = randomBytes(32).toString("base64url");
  await RefreshToken.create([{ _id: digest(value), sessionId: family._id, expiresAt: family.expiresAt }], { session });
  return value;
}

function start(user, client) {
  return connection.transaction(async (session) => {
    const current = await lockAccount(user._id, session);
    if (!current || current.isActive === false || (current.sessionVersion ?? 0) !== (user.sessionVersion ?? 0)) {
      throw denied();
    }
    const [family] = await AuthSession.create([{
      userId: user._id, client, accountVersion: current.sessionVersion ?? 0,
      expiresAt: new Date(Date.now() + life), lastUsedAt: new Date(),
    }], { session });
    return { user: current, token: accessToken(current, family.id), refreshToken: await mint(family, session), family };
  });
}

async function revokeFamily(family, actorId, reason, session) {
  if (family.revokedAt) return;
  family.revokedAt = new Date();
  await family.save({ session });
  await PushInstallation.deleteMany({ sessionId: family._id }, { session });
  await audit(session, { actorId, entityId: family._id, action: "SESSION_REVOKED", reason });
}

async function rotate(value, client) {
  if (!validToken(value)) throw denied();
  const result = await connection.transaction(async (session) => {
    const token = await RefreshToken.findById(digest(value)).session(session);
    const now = new Date();
    if (!token || token.expiresAt <= now) return null;

    const family = await AuthSession.findOne({
      _id: token.sessionId, client, revokedAt: null, expiresAt: { $gt: now },
    }).session(session);
    if (!family) return null;
    const user = await lockAccount(family.userId, session);
    if (!user || user.isActive === false || (user.sessionVersion ?? 0) !== family.accountVersion) return null;
    if (token.usedAt) {
      await revokeFamily(family, user._id, "REPLAY", session);
      return null;
    }
    token.usedAt = now;
    await token.save({ session });
    family.lastUsedAt = now;
    await family.save({ session });
    return { user, token: accessToken(user, family.id), refreshToken: await mint(family, session), family };
  });
  if (!result) throw denied();
  return result;
}

async function logout(value, client) {
  if (!validToken(value)) return;
  await connection.transaction(async (session) => {
    const token = await RefreshToken.findById(digest(value)).session(session);
    if (!token) return;
    const family = await AuthSession.findOne({ _id: token.sessionId, client }).session(session);
    if (family) await revokeFamily(family, family.userId, "LOGOUT", session);
  });
}

function revokeOwned(sessionId, actorId) {
  return connection.transaction(async (session) => {
    const family = await AuthSession.findOne({ _id: sessionId, userId: actorId }).session(session);
    if (!family) throw new ApiError(404, "Session not found.");
    await revokeFamily(family, actorId, "OWNER_REVOKED", session);
  });
}

async function revokeAccount(userId, actorId, session) {
  const result = await AuthSession.updateMany({ userId, revokedAt: null }, {
    $set: { revokedAt: new Date() },
  }, { session });
  await PushInstallation.deleteMany({ userId }, { session });
  await audit(session, { actorId, entityId: userId, action: "SESSION_REVOKED",
    reason: "ACCOUNT_CHANGED", counts: { sessions: result.modifiedCount } });
}

module.exports = { accessToken, start, rotate, logout, revokeOwned, revokeAccount };
