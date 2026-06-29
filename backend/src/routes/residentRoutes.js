const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getResidentDashboard,
} = require("../controllers/residentController");

router.get(
  "/dashboard",
  authMiddleware,
  getResidentDashboard
);

module.exports = router;