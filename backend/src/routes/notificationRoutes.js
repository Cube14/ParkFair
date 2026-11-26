const router = require("express").Router();
const { sendTest, sendActiveNotifications, sendSingleResident, previewNotifications } =
  require("../controllers/notificationController");
const { requireSendingEnabled } = require("../services/whatsappService");
const { id, text, validateBody } = require("../middleware/validateRequest");

router.post("/test", requireSendingEnabled, validateBody({ phone: text }), sendTest);
router.post("/single", requireSendingEnabled, validateBody({ flatNumber: text }, { cycleId: id }), sendSingleResident);
router.get("/preview", previewNotifications);
router.post("/send-active", requireSendingEnabled, (req, res, next) => {
  req.body ??= {};
  next();
}, validateBody({}, { cycleId: id }), sendActiveNotifications);

module.exports = router;
