const express = require("express");

const router = express.Router();

const {
  getCycleLayout,
} = require("../controllers/layoutController");

router.get(
  "/:cycleId",
  getCycleLayout
);

module.exports = router;