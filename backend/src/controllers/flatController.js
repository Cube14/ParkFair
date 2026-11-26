const { parkingWrite } = require("../services/parkingWrite");
const Allocation = require("../models/Allocation");
const CreditLedger = require("../models/CreditLedger");
const { ApiError } = require("../middleware/apiErrors");
const Flat = require("../models/Flat");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const ParkingAssignment = require("../models/ParkingAssignment");

/*
|--------------------------------------------------------------------------
| Get All Flats
|--------------------------------------------------------------------------
*/

const getAllFlats = async (req, res) => {
  const flats = await Flat.find().lean();

  const users = await User.find({ role: "RESIDENT" }).select("flatId isActive").lean();

  const vehicles = await Vehicle.find().lean();

  const result = flats.map((flat) => {
    const user = users.find(
      (u) =>
        u.flatId &&
        u.flatId.toString() === flat._id.toString()
    );

    const vehicleCount = vehicles.filter(
      (v) =>
        v.flatId &&
        v.flatId.toString() === flat._id.toString()
    ).length;

    return {
      ...flat,

      vehicleCount,

      account: {
        exists: !!user,
        userId: user?._id || null,
        isActive: Boolean(user && user.isActive !== false),
      },
    };
  });

  res.status(200).json(result);
};

/*
|--------------------------------------------------------------------------
| Create Flat
|--------------------------------------------------------------------------
*/

const createFlat = async (req, res) => {
  const { flatNumber } = req.body;

  const existingFlat = await Flat.findOne({ flatNumber });

  if (existingFlat) {
    return res.status(400).json({
      success: false,
      message: "Flat already exists",
    });
  }

  const flat = await parkingWrite(async (session) => {
    const [created] = await Flat.create([req.body], { session });
    return created;
  });

  res.status(201).json({
    success: true,
    data: flat,
  });
};

/*
|--------------------------------------------------------------------------
| Get Flat History
|--------------------------------------------------------------------------
*/

const getFlatHistory = async (req, res) => {
  const flat = await Flat.findById(req.params.flatId);

  if (!flat) {
    return res.status(404).json({
      success: false,
      message: "Flat not found",
    });
  }

  const history = await ParkingAssignment.find({
    flatId: flat._id,
  })
    .populate("cycleId", "cycleName")
    .populate("slotId", "slotNumber")
    .sort({
      createdAt: 1,
    });

  const formattedHistory = history.map((item) => ({
    cycle:
      item.cycleId?.cycleName || "Unknown",

    slot:
      item.slotId?.slotNumber || "Unknown",

    parkingType: item.parkingType,

    status: item.assignmentStatus,
  }));

  res.status(200).json({
    success: true,
    flatNumber: flat.flatNumber,
    history: formattedHistory,
  });
};

/*
|--------------------------------------------------------------------------
| Update Flat
|--------------------------------------------------------------------------
*/

const updateFlat = async (req, res) => {
  const data = await parkingWrite(async (session) => {
    const flat = await Flat.findByIdAndUpdate(req.params.id, req.body, {
      session, returnDocument: "after", runValidators: true,
    });
    if (!flat) throw new ApiError(404, "Flat not found.");
    return flat;
  });
  res.json({ success: true, data });
};

const deleteFlat = async (req, res) => {
  const flatId = req.params.id;
  await parkingWrite(async (session) => {
    for (const source of [User, Vehicle, ParkingAssignment, Allocation, CreditLedger]) {
      if (await source.exists({ flatId }).session(session)) {
        throw new ApiError(409, "This flat has linked records. Deactivate it to retain its history.");
      }
    }
    const result = await Flat.deleteOne({ _id: flatId }, { session });
    if (!result.deletedCount) throw new ApiError(404, "Flat not found.");
  });
  res.json({ success: true, message: "Flat deleted" });
};

module.exports = {
  getAllFlats,
  createFlat,
  getFlatHistory,
  updateFlat,
  deleteFlat,
};