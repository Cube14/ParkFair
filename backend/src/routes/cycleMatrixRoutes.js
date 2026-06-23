const express = require(
  "express"
);

const router =
  express.Router();

const {
  getCycleMatrix,
} = require(
  "../controllers/cycleMatrixController"
);

router.get(
  "/:cycleId/matrix",
  getCycleMatrix
);

module.exports = router;