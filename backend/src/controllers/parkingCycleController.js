const ParkingCycle = require("../models/ParkingCycle");

const createCycle = async (req, res) => {
  try {
    const cycle =
      await ParkingCycle.create(req.body);

    res.status(201).json({
      success: true,
      data: cycle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCycles = async (req, res) => {
  try {
    const cycles =
      await ParkingCycle.find().sort({
        startDate: -1,
      });

    res.status(200).json({
      success: true,
      count: cycles.length,
      data: cycles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCycle,
  getCycles,
};