const ParkingAssignment = require("../models/ParkingAssignment");
const Allocation = require("../models/Allocation");
const { ApiError } = require("../middleware/apiErrors");
const Vehicle = require("../models/Vehicle");
const Flat = require("../models/Flat");

/*
|--------------------------------------------------------------------------
| Get All Vehicles
|--------------------------------------------------------------------------
*/

const getAllVehicles = async (req, res) => {
  const vehicles = await Vehicle.find().populate(
    "flatId",
    "flatNumber ownerName"
  );

  res.status(200).json({
    success: true,
    count: vehicles.length,
    data: vehicles,
  });
};

/*
|--------------------------------------------------------------------------
| Create Vehicle
|--------------------------------------------------------------------------
*/

const createVehicle = async (req, res) => {
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
  if (req.body.flatId) {
    const vehicle = await Vehicle.findById(req.params.id).select("flatId");
    if (!vehicle) throw new ApiError(404, "Vehicle not found.");
    if (!await Flat.exists({ _id: req.body.flatId })) throw new ApiError(404, "Flat not found.");
    if (!vehicle.flatId.equals(req.body.flatId)) {
      const references = await Promise.all([ParkingAssignment, Allocation]
        .map((model) => model.exists({ vehicleId: vehicle._id })));
      if (references.some(Boolean)) throw new ApiError(409, "A vehicle with parking history cannot change flats.");
    }
  }
  const vehicle =
    await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
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
  const vehicleId = req.params.id;
  const references = await Promise.all([ParkingAssignment, Allocation]
    .map((model) => model.exists({ vehicleId })));
  if (references.some(Boolean)) {
    throw new ApiError(409, "This vehicle has parking history. Deactivate it to retain its history.");
  }
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
};

module.exports = {
  getAllVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};