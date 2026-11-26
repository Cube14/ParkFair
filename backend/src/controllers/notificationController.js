const { ApiError } = require("../middleware/apiErrors");
const { id } = require("../middleware/validateRequest");
const { sendMessage } = require("../services/whatsappService");
const { sendActiveCycleNotifications, previewActiveCycleNotifications } = require("../services/notificationService");

exports.sendTest = async (req, res) => {
  await sendMessage(req.body.phone, "ParkFair WhatsApp delivery test.");
  res.json({ success: true, message: "Message sent successfully." });
};

exports.sendSingleResident = async (req, res) => {
  const result = await sendActiveCycleNotifications(req.body.cycleId, req.body.flatNumber);
  res.json({ ...result, message: "Notification sent successfully." });
};

exports.previewNotifications = async (req, res) => {
  const { cycleId } = req.query;
  if (cycleId !== undefined && !id(cycleId)) throw new ApiError(400, "Invalid cycle ID.");
  res.json(await previewActiveCycleNotifications(cycleId));
};

exports.sendActiveNotifications = async (req, res) => {
  res.json(await sendActiveCycleNotifications(req.body?.cycleId));
};
