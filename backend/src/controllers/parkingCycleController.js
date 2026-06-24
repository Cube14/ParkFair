const ParkingCycle = require("../models/ParkingCycle");

const createCycle = async (req, res) => {
  try {
    const existingCycle =
      await ParkingCycle.findOne({
        cycleName: req.body.cycleName,
      });

    if (existingCycle) {
      return res.status(400).json({
        success: false,
        message:
          "Cycle name already exists",
      });
    }

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

const updateCycleStatus = async (
  req,
  res
) => {
  try {
    const { status } = req.body;

    const cycle =
      await ParkingCycle.findById(
        req.params.id
      );

    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: "Cycle not found",
      });
    }

    const validStatuses = [
      "PLANNED",
      "ACTIVE",
      "COMPLETED",
    ];

    if (
      !validStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status value",
      });
    }

    // Only one ACTIVE cycle at a time
    if (status === "ACTIVE") {
      await ParkingCycle.updateMany(
        { status: "ACTIVE" },
        { status: "COMPLETED" }
      );
    }

    cycle.status = status;

    await cycle.save();

    res.status(200).json({
      success: true,
      message:
        "Cycle status updated",
      data: cycle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const completeCycle = async (
  req,
  res
) => {
  try {
    const cycle =
      await ParkingCycle.findById(
        req.params.id
      );

    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: "Cycle not found",
      });
    }

    cycle.status = "COMPLETED";

    await cycle.save();

    res.status(200).json({
      success: true,
      message:
        "Cycle completed successfully",
      data: cycle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




const deleteCycle = async (
  req,
  res
) => {
  try {
    await ParkingCycle.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Cycle deleted",
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
  deleteCycle,
  updateCycleStatus,
  completeCycle,
};