const { ApiError } = require("../middleware/apiErrors");

function requireSendingEnabled() {
  throw new ApiError(503, "WhatsApp sending is disabled.");
}

async function sendMessage() {
  requireSendingEnabled();
}

module.exports = { requireSendingEnabled, sendMessage };
