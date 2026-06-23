const express = require("express");

const router = express.Router();

const {
  createCycle,
  getCycles,
} = require("../controllers/parkingCycleController");

router.post("/", createCycle);

router.get("/", getCycles);

module.exports = router;