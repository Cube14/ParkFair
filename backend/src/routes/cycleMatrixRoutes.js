const express = require(
  "express"
);

const router =
  express.Router();

const { validateIds } = require("../middleware/validateRequest");
const {
  getCycleMatrix,
} = require(
  "../controllers/cycleMatrixController"
);

router.get(
  "/:cycleId/matrix",
  validateIds("cycleId"),
  getCycleMatrix
);

module.exports = router;