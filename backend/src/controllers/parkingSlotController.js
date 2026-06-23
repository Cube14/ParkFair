const ParkingSlot = require("../models/ParkingSlot");

const createSlot = async (req, res) => {
  try {
    const slot = await ParkingSlot.create(req.body);

    res.status(201).json({
      success: true,
      data: slot,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getSlots = async (req, res) => {
  try {
    const slots = await ParkingSlot.find();

    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createSlot,
  getSlots,
};