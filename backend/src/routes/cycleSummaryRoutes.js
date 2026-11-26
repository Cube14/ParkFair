const express = require(
  "express"
);

const router =
  express.Router();

const { validateIds } = require("../middleware/validateRequest");
const {
  getCycleSummary,
} = require(
  "../controllers/cycleSummaryController"
);

router.get(
  "/:cycleId/summary",
  validateIds("cycleId"),
  getCycleSummary
);

module.exports = router;