const { parkingWrite } = require("./parkingWrite");
const Vehicle = require("../models/Vehicle");
const Rotation = require("../models/Rotation");
const Allocation = require("../models/Allocation");
const CreditLedger = require("../models/CreditLedger");
const { INSIDE_SLOTS, ROTATION_DAYS } = require("../config/parkingConfig");
const { ApiError } = require("../middleware/apiErrors");
const ParkingSlot = require("../models/ParkingSlot");
const { DOMAIN } = require("./siddhaParking");

function generateFirstRotation() {
  return parkingWrite(async (session) => {
    if (await ParkingSlot.exists({ domain: DOMAIN, isActive: true }).session(session)) {
      throw new ApiError(409, "Use an allocation dossier for Siddha-A physical parking positions.");
    }
    if (await Rotation.exists({ rotationNumber: 1 }).session(session)) {
      throw new ApiError(409, "Rotation #1 already exists");
    }
    const vehicles = await Vehicle.find({ isActive: true }).populate("flatId").session(session);
    if (vehicles.length < INSIDE_SLOTS) {
      throw new ApiError(409, "There are too few active vehicles for the configured inside capacity.");
    }
    if (vehicles.some((vehicle) => !vehicle.flatId)) {
      throw new ApiError(409, "An active vehicle references a missing flat.");
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + ROTATION_DAYS);
    const [rotation] = await Rotation.create([{ rotationNumber: 1, startDate, endDate }], { session });
    const records = vehicles.map((vehicle, index) => ({
      flatId: vehicle.flatId._id, vehicleId: vehicle._id, rotationId: rotation._id,
      parkingType: index < INSIDE_SLOTS ? "INSIDE" : "OUTSIDE", startDate, endDate,
    }));
    await Allocation.insertMany(records, { session });
    for (const record of records) {
      const inside = record.parkingType === "INSIDE";
      await CreditLedger.updateOne({ flatId: record.flatId }, {
        $inc: inside
          ? { insideRotations: 1, balanceScore: -1 }
          : { outsideRotations: 1, balanceScore: 1 },
        $set: { lastReason: inside ? "Initial inside allocation" : "Initial outside allocation" },
      }, { session, upsert: true });
    }
    return {
      rotationNumber: 1, rotationId: rotation._id,
      insideCount: INSIDE_SLOTS, outsideCount: vehicles.length - INSIDE_SLOTS,
    };
  });
}

module.exports = { generateFirstRotation };
