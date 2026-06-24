const express = require("express");

const router = express.Router();

const {
  cloneCycle,
} = require(
  "../controllers/cloneCycleController"
);

router.post(
  "/:cycleId/clone",
  cloneCycle
);

module.exports = router;