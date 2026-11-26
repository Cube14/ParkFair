const router = require("express").Router();
const { validateBody } = require("../middleware/validateRequest");
const { registerSynthetic } = require("../services/mockPush");
const { ResidentInbox } = require("../models/PushFoundation");

router.post("/mock-push-installation", validateBody({
  installationId: (value) => typeof value === "string" && /^mock-[a-z0-9-]{8,80}$/.test(value),
  platform: (value) => ["ios", "android"].includes(value),
  token: (value) => typeof value === "string" && /^synthetic-[a-z0-9-]{12,80}$/.test(value),
}), async (req, res) => {
  const installationId = await registerSynthetic(req.user, req.body);
  res.status(201).json({ success: true, installationId });
});
router.get("/inbox", async (req, res) => {
  const events = await ResidentInbox.find({ userId: req.user.id }).select("kind publicationId createdAt")
    .sort({ createdAt: -1, _id: -1 }).limit(50);
  res.json({ success: true, events });
});
module.exports = router;
