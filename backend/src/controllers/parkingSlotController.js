const ParkingSlot = require("../models/ParkingSlot");

const createSlot = async (req, res) => {
  const slot = await ParkingSlot.create(req.body);

  res.status(201).json({
    success: true,
    data: slot,
  });
};

const getSlots = async (req, res) => {
  const slots = await ParkingSlot.find();

  res.status(200).json({
    success: true,
    count: slots.length,
    data: slots,
  });
};

module.exports = {
  createSlot,
  getSlots,
};