const path = require("node:path");
const { ApiError } = require("../middleware/apiErrors");

let client;
let initialization;
let ready = false;
const canSend = () => process.env.WHATSAPP_ENABLED === "true" &&
  process.env.WHATSAPP_SEND_APPROVED === "true" && process.env.NODE_ENV === "production";

function requireSendingEnabled(req, res, next) {
  if (!canSend()) throw new ApiError(503, "WhatsApp sending is disabled.");
  next();
}

function getClient() {
  if (!initialization) {
    const { Client, LocalAuth } = require("whatsapp-web.js");
    client = new Client({
      authStrategy: new LocalAuth({ dataPath: path.join(__dirname, "../sessions") }),
      puppeteer: { headless: true },
    });
    client.on("ready", () => { ready = true; });
    client.on("disconnected", () => { ready = false; });
    client.on("auth_failure", () => { ready = false; });
    initialization = client.initialize().catch(async () => {
      await client.destroy().catch(() => {});
      ready = false;
      initialization = undefined;
      throw new ApiError(503, "WhatsApp could not initialize.");
    });
  }
  return initialization;
}

async function sendMessage(phone, message) {
  if (!canSend()) throw new ApiError(503, "WhatsApp sending is disabled.");
  const digits = typeof phone === "string" ? phone.replace(/\D/g, "") : "";
  const number = digits.length === 10 ? `91${digits}` : digits;
  if (!/^91\d{10}$/.test(number)) throw new ApiError(400, "A valid Indian phone number is required.");

  await getClient();
  if (!ready) throw new ApiError(503, "WhatsApp session is not ready.");
  const chat = `${number}@c.us`;
  if (!await client.isRegisteredUser(chat)) throw new ApiError(422, "WhatsApp recipient is unavailable.");
  await client.sendMessage(chat, message);
}

module.exports = { requireSendingEnabled, sendMessage };
