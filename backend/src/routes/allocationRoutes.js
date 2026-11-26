const mongoose = require("mongoose");
const router = require("express").Router();
const { generateRotation } = require("../controllers/allocationController");
const Rotation = require("../models/Rotation");
const Allocation = require("../models/Allocation");
const CreditLedger = require("../models/CreditLedger");
const requireDevReset = require("../middleware/requireDevReset");

router.post("/generate", generateRotation);
router.get("/all", async (req, res) => {
  res.json(await Allocation.find().populate("flatId", "flatNumber").populate("vehicleId", "vehicleNumber"));
});
router.get("/rotations", async (req, res) => res.json(await Rotation.find()));
router.get("/ledgers", async (req, res) => res.json(await CreditLedger.find()));
router.delete("/reset", requireDevReset, async (req, res) => {
  await mongoose.connection.transaction(async (session) => {
    await Rotation.deleteMany({}, { session });
    await Allocation.deleteMany({}, { session });
    await CreditLedger.deleteMany({}, { session });
  });
  res.json({ success: true, message: "Database reset complete" });
});
module.exports = router;
