const express = require("express");

const router = express.Router();

const {
  createCycle,
  getCycles,
  deleteCycle,
} = require("../controllers/parkingCycleController");

router.post("/", createCycle);

router.get("/", getCycles);

router.delete("/:id", deleteCycle);

module.exports = router;