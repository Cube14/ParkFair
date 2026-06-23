console.log("Cycle Summary Routes Loaded");
const express = require(
  "express"
);

const router =
  express.Router();

const {
  getCycleSummary,
} = require(
  "../controllers/cycleSummaryController"
);

router.get(
  "/:cycleId/summary",
  getCycleSummary
);

module.exports = router;