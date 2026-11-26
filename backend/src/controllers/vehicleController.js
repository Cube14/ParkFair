const ParkingAssignment = require("../models/ParkingAssignment");
const Allocation = require("../models/Allocation");
const Vehicle = require("../models/Vehicle");
const Flat = require("../models/Flat");
const { ApiError } = require("../middleware/apiErrors");
const { parkingWrite } = require("../services/parkingWrite");

async function getAllVehicles(req, res) {
  const data = await Vehicle.find().populate("flatId", "flatNumber ownerName");
  res.json({ success: true, count: data.length, data });
}

async function createVehicle(req, res) {
  const data = await parkingWrite(async (session) => {
    if (!await Flat.exists({ _id: req.body.flatId }).session(session)) throw new ApiError(404, "Flat not found.");
    const [vehicle] = await Vehicle.create([req.body], { session });
    return vehicle;
  });
  res.status(201).json({ success: true, data });
}

async function hasHistory(vehicleId, session) {
  return await ParkingAssignment.exists({ vehicleId }).session(session) ||
    await Allocation.exists({ vehicleId }).session(session);
}

async function updateVehicle(req, res) {
  const data = await parkingWrite(async (session) => {
    const vehicle = await Vehicle.findById(req.params.id).session(session);
    if (!vehicle) throw new ApiError(404, "Vehicle not found.");
    const { flatId } = req.body;
    if (flatId && !vehicle.flatId?.equals(flatId)) {
      if (!await Flat.exists({ _id: flatId }).session(session)) throw new ApiError(404, "Flat not found.");
      if (await hasHistory(vehicle._id, session)) throw new ApiError(409, "A vehicle with parking history cannot change flats.");
    }
    vehicle.set(req.body);
    return vehicle.save({ session });
  });
  res.json({ success: true, data });
}

async function deleteVehicle(req, res) {
  await parkingWrite(async (session) => {
    const vehicleId = req.params.id;
    if (await hasHistory(vehicleId, session)) {
      throw new ApiError(409, "This vehicle has parking history. Deactivate it to retain its history.");
    }
    const result = await Vehicle.deleteOne({ _id: vehicleId }, { session });
    if (!result.deletedCount) throw new ApiError(404, "Vehicle not found.");
  });
  res.json({ success: true, message: "Vehicle deleted successfully" });
}

module.exports = { getAllVehicles, createVehicle, updateVehicle, deleteVehicle };
