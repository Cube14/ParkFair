const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { isObjectIdOrHexString } = require("mongoose");
const Flat = require("../models/Flat");
const User = require("../models/User");
const { ApiError } = require("../middleware/apiErrors");

const dummyHash = bcrypt.hashSync("parkfair-login-timing-placeholder", 10);

function validPassword(password, minimum = 1) {
  return typeof password === "string" &&
    password.length >= minimum && Buffer.byteLength(password, "utf8") <= 72;
}

function publicUser(user) {
  return {
    id: user._id,
    _id: user._id,
    username: user.username,
    role: user.role,
    flat: user.flatId,
    flatId: user.flatId,
    isActive: user.isActive !== false,
  };
}

exports.login = async (req, res) => {
  const { identifier, password } = req.body ?? {};
  if (typeof identifier !== "string" || !identifier.trim() ||
      identifier.length > 128 || (typeof password !== "string" || !password || password.length > 1024)) {
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

  const token = jwt.sign({ id: user._id, role: user.role, version: user.sessionVersion ?? 0 }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "1h",
  });
  res.json({ success: true, token, user: publicUser(user) });
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user.id).populate("flatId", "flatNumber ownerName");
  if (!user) throw new ApiError(404, "User not found.");
  res.json({ success: true, user: publicUser(user) });
};

exports.createResidentAccount = async (req, res) => {
  const { flatId, password } = req.body ?? {};
  if (!isObjectIdOrHexString(flatId) || !validPassword(password, 8)) {
    throw new ApiError(400, "Provide a valid flat and a password of at least 8 characters and at most 72 bytes.");
  }
  const flat = await Flat.findById(flatId);
  if (!flat) throw new ApiError(404, "Flat not found.");
  if (await User.exists({ flatId })) throw new ApiError(409, "Resident account already exists.");

  const user = await User.create({
    username: flat.flatNumber,
    password: await bcrypt.hash(password, 10),
    role: "RESIDENT",
    flatId,
  });
  res.status(201).json({ success: true, user: publicUser(user) });
};

exports.resetResidentPassword = async (req, res) => {
  const { password } = req.body ?? {};
  if (!validPassword(password, 8)) {
    throw new ApiError(400, "Use a password of at least 8 characters and at most 72 bytes.");
  }
  const user = await User.findOne({ _id: req.params.id, role: "RESIDENT" });
  if (!user) throw new ApiError(404, "Resident account not found.");
  await User.updateOne({ _id: user._id }, {
    $set: { password: await bcrypt.hash(password, 10) },
    $inc: { sessionVersion: 1 },
  });
  res.json({ success: true });
};

exports.toggleResidentStatus = async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, role: "RESIDENT" },
    [{ $set: { isActive: { $eq: ["$isActive", false] },
      sessionVersion: { $add: [{ $ifNull: ["$sessionVersion", 0] }, 1] } } }],
    { returnDocument: "after", updatePipeline: true }
  );
  if (!user) throw new ApiError(404, "Resident account not found.");
  res.json({ success: true, isActive: user.isActive });
};
