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
  try {
    const flats = await Flat.find().lean();

    const users = await User.find().lean();

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
          isActive: user?.isActive || false,
        },
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Create Flat
|--------------------------------------------------------------------------
*/

const createFlat = async (req, res) => {
  try {
    const { flatNumber, ownerName } = req.body;

    const existingFlat = await Flat.findOne({
      flatNumber,
    });

    if (existingFlat) {
      return res.status(400).json({
        success: false,
        message: "Flat already exists",
      });
    }

    const flat = await Flat.create({
      flatNumber,
      ownerName,
    });

    res.status(201).json({
      success: true,
      data: flat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Flat History
|--------------------------------------------------------------------------
*/

const getFlatHistory = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update Flat
|--------------------------------------------------------------------------
*/

const updateFlat = async (req, res) => {
  try {
    const flat =
      await Flat.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!flat) {
      return res.status(404).json({
        success: false,
        message: "Flat not found",
      });
    }

    res.status(200).json({
      success: true,
      data: flat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Delete Flat
|--------------------------------------------------------------------------
*/

const deleteFlat = async (req, res) => {
  try {
    const flat =
      await Flat.findByIdAndDelete(
        req.params.id
      );

    if (!flat) {
      return res.status(404).json({
        success: false,
        message: "Flat not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Flat deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllFlats,
  createFlat,
  getFlatHistory,
  updateFlat,
  deleteFlat,
};