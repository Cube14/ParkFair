const {
  Client,
  LocalAuth,
} = require("whatsapp-web.js");

const qrcode = require("qrcode-terminal");
const path = require("path");

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: path.join(
      __dirname,
      "../sessions"
    ),
  }),

  puppeteer: {
    headless: true,

    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
  },
});

// No ready flag needed

client.on("qr", (qr) => {
  console.log(
    "\n===================================="
  );

  console.log(
    "Scan this QR with WhatsApp"
  );

  console.log(
    "====================================\n"
  );

  qrcode.generate(qr, {
    small: true,
  });
});

client.on("authenticated",  () => {
  console.log("✅ WhatsApp Authenticated");

  setTimeout(async () => {
    try {
      console.log("State:", await client.getState());
      
      console.log("Info:", client.info);
    } catch (err) {
      console.error(err);
    }
  }, 5000);
});

client.on("ready", async () => {
  

  console.log(
    "🚀 WhatsApp Client Ready"
  );
  const info = await client.getState();
  console.log("STATE: ", info);
});
client.on("loading_screen", (percent, message) => {
  console.log(percent, message);
});
client.on(
  "auth_failure",
  (msg) => {
    console.error(
      "Authentication Failed",
      msg
    );
  }
);

client.on(
  "disconnected",
  (reason) => {
    

    console.log(
      "WhatsApp Disconnected",
      reason
    );
  }
);

client.initialize();

async function sendMessage(
  phone,
  message
) {
  if (process.env.WHATSAPP_ENABLED !== "true") {
      console.log("\n========== WHATSAPP DISABLED ==========");
      console.log("TO:", phone);
      console.log(message);
      console.log("=======================================\n");
      return;
  }
  const state = await client.getState();
  if (state !== "CONNECTED") {
    throw new Error(
        "WhatsApp client is not connected."
    );
  }

  let number = phone.replace(/\D/g, "");

  if (!number.startsWith("91")) {
    number = "91" + number;
    }

  const chatId = number + "@c.us";

  const registered =
    await client.isRegisteredUser(chatId);
  if (!registered) {
    throw new Error(
        `WhatsApp is not registered for ${number}.`
    );
  }
  return await client.sendMessage(chatId, message);
}

module.exports = {
  client,
  sendMessage,
};