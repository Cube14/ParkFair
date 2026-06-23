const Vehicle = require("../models/Vehicle");
const Rotation = require("../models/Rotation");
const Allocation = require("../models/Allocation");
const CreditLedger = require("../models/CreditLedger");

const {
  INSIDE_SLOTS,
  ROTATION_DAYS,
} = require("../config/parkingConfig");

const generateFirstRotation = async () => {
  try {
    console.log("🚀 Starting Rotation #1 Generation");

    const existingRotation = await Rotation.findOne({
      rotationNumber: 1,
    });

    if (existingRotation) {
      throw new Error("Rotation #1 already exists");
    }

    const vehicles = await Vehicle.find({
      isActive: true,
    }).populate("flatId");

    console.log(
      `🚗 Active Vehicles Found: ${vehicles.length}`
    );

    if (vehicles.length < INSIDE_SLOTS) {
      throw new Error(
        `Not enough active vehicles. Found ${vehicles.length}, need at least ${INSIDE_SLOTS}`
      );
    }

    const startDate = new Date();

    const endDate = new Date(startDate);

    endDate.setDate(
      startDate.getDate() + ROTATION_DAYS
    );

    const rotation = await Rotation.create({
      rotationNumber: 1,
      startDate,
      endDate,
    });

    console.log(
      `✅ Rotation Created: ${rotation._id}`
    );

    const insideVehicles = vehicles.slice(
      0,
      INSIDE_SLOTS
    );

    const outsideVehicles = vehicles.slice(
      INSIDE_SLOTS
    );

    console.log(
      `🏠 Inside Vehicles: ${insideVehicles.length}`
    );

    console.log(
      `🌳 Outside Vehicles: ${outsideVehicles.length}`
    );

    // INSIDE VEHICLES
    for (const vehicle of insideVehicles) {
      console.log(
        `➡️ INSIDE: ${vehicle.vehicleNumber}`
      );

      const allocation =
        await Allocation.create({
          flatId: vehicle.flatId._id,
          vehicleId: vehicle._id,
          rotationId: rotation._id,
          parkingType: "INSIDE",
          startDate,
          endDate,
        });

      console.log(
        `✅ Allocation Created: ${allocation._id}`
      );

      const ledger =
        await CreditLedger.findOneAndUpdate(
          {
            flatId: vehicle.flatId._id,
          },
          {
            $inc: {
              insideRotations: 1,
              balanceScore: -1,
            },
            $set: {
              lastReason:
                "Initial inside allocation",
            },
          },
          {
            upsert: true,
            new: true,
          }
        );

      console.log(
        `✅ Ledger Updated: ${ledger._id}`
      );
    }

    // OUTSIDE VEHICLES
    for (const vehicle of outsideVehicles) {
      console.log(
        `➡️ OUTSIDE: ${vehicle.vehicleNumber}`
      );

      const allocation =
        await Allocation.create({
          flatId: vehicle.flatId._id,
          vehicleId: vehicle._id,
          rotationId: rotation._id,
          parkingType: "OUTSIDE",
          startDate,
          endDate,
        });

      console.log(
        `✅ Allocation Created: ${allocation._id}`
      );

      const ledger =
        await CreditLedger.findOneAndUpdate(
          {
            flatId: vehicle.flatId._id,
          },
          {
            $inc: {
              outsideRotations: 1,
              balanceScore: 1,
            },
            $set: {
              lastReason:
                "Initial outside allocation",
            },
          },
          {
            upsert: true,
            new: true,
          }
        );

      console.log(
        `✅ Ledger Updated: ${ledger._id}`
      );
    }

    console.log(
      "🎉 Rotation #1 Generated Successfully"
    );

    return {
      rotationNumber: 1,
      rotationId: rotation._id,
      insideCount: insideVehicles.length,
      outsideCount: outsideVehicles.length,
    };
  } catch (error) {
    console.error(
      "❌ Rotation Generation Error:"
    );
    console.error(error);

    throw error;
  }
};

module.exports = {
  generateFirstRotation,
};