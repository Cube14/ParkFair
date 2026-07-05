const express = require("express");

const router = express.Router();

const {
  sendTest,
  sendActiveNotifications,
  sendSingleResident,
  previewNotifications
} = require("../controllers/notificationController");

router.post(
  "/test",
  sendTest
);

router.post(
  "/single",
  sendSingleResident
);
router.get(
  "/preview",
  previewNotifications
);
router.post(
  "/send-active",
  sendActiveNotifications
);

module.exports = router;