const { parkingWrite } = require("../services/parkingWrite");
const ParkingSlot = require("../models/ParkingSlot");
const { ApiError } = require("../middleware/apiErrors");
const { DOMAIN, isReal, isTestSlot, reserved, slotLabel, usesSiddha } = require("../services/siddhaParking");

const createSlot = async (req, res) => {
  const slot = await parkingWrite(async (session) => {
    if (reserved.has(slotLabel(req.body.slotNumber)) || await ParkingSlot.exists({ domain: DOMAIN, isActive: true }).session(session)) {
      throw new ApiError(409, "Siddha-A positions are defined by the managed physical inventory.");
    }
    const [created] = await ParkingSlot.create([req.body], { session });
    return created;
  });

  res.status(201).json({
    success: true,
    data: slot,
  });
};

const getSlots = async (req, res) => {
  const all = await ParkingSlot.find().sort({ displayOrder: 1, _id: 1 });
  const managed = usesSiddha(all);
  const slots = req.query.context === "testing" ? all.filter(isTestSlot) : all.filter(slot =>
    !isTestSlot(slot) && (!managed || isReal(slot, true)));

  res.status(200).json({
    success: true,
    count: slots.length,
    domain: managed ? DOMAIN : null,
    data: slots,
  });
};

module.exports = {
  createSlot,
  getSlots,
};
