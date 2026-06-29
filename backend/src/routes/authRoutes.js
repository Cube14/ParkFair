const express = require("express");

const router = express.Router();

const {
  login,
  me,
  createResidentAccount,
  resetResidentPassword,
  toggleResidentStatus,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/login",
  login
);

router.get(
  "/me",
  authMiddleware,
  me
);

/*
|--------------------------------------------------------------------------
| Resident Account Management
|--------------------------------------------------------------------------
*/

router.post(
  "/resident",
  authMiddleware,
  createResidentAccount
);

router.put(
  "/resident/:id/password",
  authMiddleware,
  resetResidentPassword
);

router.put(
  "/resident/:id/toggle",
  authMiddleware,
  toggleResidentStatus
);

module.exports = router;