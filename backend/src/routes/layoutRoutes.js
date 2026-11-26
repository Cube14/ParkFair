const express = require("express");

const router = express.Router();

const { validateIds } = require("../middleware/validateRequest");
const {
  getCycleLayout,
} = require("../controllers/layoutController");

router.get(
  "/:cycleId",
  validateIds("cycleId"),
  getCycleLayout
);

module.exports = router;