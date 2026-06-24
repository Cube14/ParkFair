const express = require("express");

const router = express.Router();

const {
  createCycle,
  getCycles,
  deleteCycle,
  updateCycleStatus,
  completeCycle
} = require("../controllers/parkingCycleController");

router.post("/", createCycle);

router.get("/", getCycles);
router.put("/:id/status", updateCycleStatus);
router.delete("/:id", deleteCycle);
router.put("/:id/complete", completeCycle);

module.exports = router;