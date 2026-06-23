const express = require("express");

const router = express.Router();

const {
  generateRotation,
} = require("../controllers/allocationController");

router.post(
  "/generate",
  generateRotation
);
router.get("/all", async (req, res) => {
  const Allocation = require("../models/Allocation");

  const allocations = await Allocation.find()
    .populate("flatId", "flatNumber")
    .populate("vehicleId", "vehicleNumber");

  res.json(allocations);
});
router.get("/rotations", async (req, res) => {
  const Rotation = require("../models/Rotation");

  const rotations =
    await Rotation.find();

  res.json(rotations);
});
router.get("/ledgers", async (req, res) => {
  const CreditLedger = require("../models/CreditLedger");

  const ledgers =
    await CreditLedger.find();

  res.json(ledgers);
});
router.delete("/reset", async (req, res) => {
  try {
    const Rotation = require("../models/Rotation");
    const Allocation = require("../models/Allocation");
    const CreditLedger = require("../models/CreditLedger");

    await Rotation.deleteMany({});
    await Allocation.deleteMany({});
    await CreditLedger.deleteMany({});

    res.json({
      success: true,
      message: "Database reset complete",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
module.exports = router;