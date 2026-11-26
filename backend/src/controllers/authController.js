const bcrypt = require("bcryptjs");
const { isObjectIdOrHexString } = require("mongoose");
const Flat = require("../models/Flat");
const User = require("../models/User");
const { AuthSession } = require("../models/AuthSession");
const { ApiError } = require("../middleware/apiErrors");
const { parkingWrite } = require("../services/parkingWrite");
const sessions = require("../services/authSessions");
const { transport, readRefresh, writeSession, clearWebSession } = require("../middleware/sessionTransport");

const dummyHash = bcrypt.hashSync("parkfair-login-timing-placeholder", 10);

function validPassword(password, minimum = 1) {
  return typeof password === "string" &&
    password.length >= minimum && Buffer.byteLength(password, "utf8") <= 72;
}

function publicUser(user) {
  return {
    id: user._id, _id: user._id, username: user.username, role: user.role,
    flat: user.flatId, flatId: user.flatId, isActive: user.isActive !== false,
  };
}

exports.login = async (req, res) => {
  const client = transport(req, true);
  const { identifier, password } = req.body ?? {};
  if (typeof identifier !== "string" || !identifier.trim() || identifier.length > 128 ||
      typeof password !== "string" || !password || password.length > 1024) {
    throw new ApiError(400, "Enter a valid username or flat number and password.");
  }
  const username = identifier.trim();
  let user = await User.findOne({ username }).select("+password +sessionVersion")
    .populate("flatId", "flatNumber ownerName");
  if (!user) {
    const flat = await Flat.findOne({ flatNumber: username }).select("_id");
    if (flat) {
      user = await User.findOne({ flatId: flat._id, role: "RESIDENT" })
        .select("+password +sessionVersion").populate("flatId", "flatNumber ownerName");
    }
  }
  const matches = await bcrypt.compare(password, user?.password ?? dummyHash);
  if (!user || !matches) throw new ApiError(401, "Invalid username or password.");
  if (user.isActive === false) throw new ApiError(403, "Your account has been disabled.");
  if (!client) return res.json({ success: true, token: sessions.accessToken(user), user: publicUser(user) });
  // A fresh sign-in replaces a previous login in the same browser.
  if (client === "web") await sessions.logout(readRefresh(req, client), client);
  writeSession(res, client, await sessions.start(user, client), publicUser);
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user.id).populate("flatId", "flatNumber ownerName");
  if (!user) throw new ApiError(404, "User not found.");
  res.json({ success: true, user: publicUser(user) });
};

exports.refresh = async (req, res) => {
  const client = transport(req);
  try {
    writeSession(res, client, await sessions.rotate(readRefresh(req, client), client), publicUser);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) clearWebSession(res, client);
    throw error;
  }
};

exports.logout = async (req, res) => {
  const client = transport(req);
  await sessions.logout(readRefresh(req, client), client);
  clearWebSession(res, client);
  res.json({ success: true });
};

exports.listSessions = async (req, res) => {
  const sessions = await AuthSession.find({ userId: req.user.id, revokedAt: null, expiresAt: { $gt: new Date() } })
    .select("client expiresAt lastUsedAt createdAt").sort({ lastUsedAt: -1 }).limit(100);
  res.json({ success: true, sessions: sessions.map(entry => ({ ...entry.toObject(), current: String(entry._id) === String(req.user.sessionId) })) });
};

exports.revokeSession = async (req, res) => {
  await sessions.revokeOwned(req.params.id, req.user.id);
  res.json({ success: true });
};

exports.createResidentAccount = async (req, res) => {
  const { flatId, password } = req.body ?? {};
  if (!isObjectIdOrHexString(flatId) || !validPassword(password, 8)) {
    throw new ApiError(400, "Provide a valid flat and a password of at least 8 characters and at most 72 bytes.");
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await parkingWrite(async (session) => {
    const flat = await Flat.findById(flatId).session(session);
    if (!flat) throw new ApiError(404, "Flat not found.");
    if (await User.exists({ flatId }).session(session)) throw new ApiError(409, "Resident account already exists.");
    const [account] = await User.create([{
      username: flat.flatNumber, password: hash, role: "RESIDENT", flatId,
    }], { session });
    return account;
  });
  res.status(201).json({ success: true, user: publicUser(user) });
};

exports.resetResidentPassword = async (req, res) => {
  const { password } = req.body ?? {};
  if (!validPassword(password, 8)) throw new ApiError(400, "Use a password of at least 8 characters and at most 72 bytes.");
  const hash = await bcrypt.hash(password, 10);
  await parkingWrite(async (session) => {
    const user = await User.findOneAndUpdate({ _id: req.params.id, role: "RESIDENT" }, {
      $set: { password: hash }, $inc: { sessionVersion: 1 },
    }, { session });
    if (!user) throw new ApiError(404, "Resident account not found.");
    await sessions.revokeAccount(user._id, req.user.id, session);
  });
  res.json({ success: true });
};

exports.toggleResidentStatus = async (req, res) => {
  const user = await parkingWrite(async (session) => {
    const account = await User.findOneAndUpdate(
      { _id: req.params.id, role: "RESIDENT" },
      [{ $set: { isActive: { $eq: ["$isActive", false] },
        sessionVersion: { $add: [{ $ifNull: ["$sessionVersion", 0] }, 1] } } }],
      { session, returnDocument: "after", updatePipeline: true }
    );
    if (!account) throw new ApiError(404, "Resident account not found.");
    await sessions.revokeAccount(account._id, req.user.id, session);
    return account;
  });
  res.json({ success: true, isActive: user.isActive });
};
