const Vehicle = require("../models/Vehicle");
const Flat = require("../models/Flat");

/*
|--------------------------------------------------------------------------
| Get All Vehicles
|--------------------------------------------------------------------------
*/

const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate(
      "flatId",
      "flatNumber ownerName"
    );

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
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
| Create Vehicle
|--------------------------------------------------------------------------
*/

const createVehicle = async (req, res) => {
  try {
    const {
      vehicleNumber,
      vehicleType,
      flatId,
    } = req.body;

    const flat =
      await Flat.findById(flatId);

    if (!flat) {
      return res.status(404).json({
        success: false,
        message: "Flat not found",
      });
    }

    const existingVehicle =
      await Vehicle.findOne({
        vehicleNumber,
      });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message:
          "Vehicle already exists",
      });
    }

    const vehicle =
      await Vehicle.create({
        vehicleNumber,
        vehicleType,
        flatId,
      });

    res.status(201).json({
      success: true,
      data: vehicle,
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
| Update Vehicle
|--------------------------------------------------------------------------
*/

const updateVehicle = async (
  req,
  res
) => {
  try {
    const vehicle =
      await Vehicle.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle,
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
| Delete Vehicle
|--------------------------------------------------------------------------
*/

const deleteVehicle = async (
  req,
  res
) => {
  try {
    const vehicle =
      await Vehicle.findByIdAndDelete(
        req.params.id
      );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Vehicle deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};