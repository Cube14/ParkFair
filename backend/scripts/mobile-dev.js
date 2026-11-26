const { createServer } = require("node:https");
const { readFileSync } = require("node:fs");
const { randomBytes } = require("node:crypto");
const { isIP } = require("node:net");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const [bind, keyPath, certPath, mongoPort = "27149"] = process.argv.slice(2);
if (isIP(bind) !== 4 || !/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(bind)
    || !keyPath || !certPath || !/^\d{1,5}$/.test(mongoPort)) {
  throw new Error("Usage: node scripts/mobile-dev.js <private IPv4> <TLS key> <TLS chain> [isolated Mongo port]");
}
Object.assign(process.env, {
  NODE_ENV: "development",
  JWT_SECRET: randomBytes(48).toString("hex"),
  WHATSAPP_ENABLED: "false",
  WHATSAPP_SEND_APPROVED: "false",
  ENABLE_DEV_RESETS: "false",
  WEB_ORIGINS: "",
});
const app = require("../src/app");
const User = require("../src/models/User");
const Flat = require("../src/models/Flat");
const Vehicle = require("../src/models/Vehicle");
const Slot = require("../src/models/ParkingSlot");
const tls = { key: readFileSync(keyPath), cert: readFileSync(certPath), minVersion: "TLSv1.2" };

async function start() {
  const database = "parkfair_dev_mobile_" + randomBytes(8).toString("hex");
  await mongoose.connect("mongodb://127.0.0.1:" + mongoPort + "/" + database + "?directConnection=true");
  const hello = await mongoose.connection.db.command({ hello: 1 });
  if (hello.setName !== "parkfair-dev" || !hello.isWritablePrimary) throw new Error("Use the isolated ParkFair development replica set.");
  await Promise.all(Object.values(mongoose.models).map(model => model.init()));
  const [one, two] = await Flat.create([{ flatNumber: "001" }, { flatNumber: "002" }]);
  await Vehicle.create([{ flatId: one.id, vehicleNumber: "FIX-A" }, { flatId: two.id, vehicleNumber: "FIX-B" }]);
  await Slot.create([
    { slotNumber: "A-12", side: "A", maxCapacity: 1, displayOrder: 1 },
    { slotNumber: "C-03", side: "OUTSIDE", maxCapacity: 2, displayOrder: 2 },
  ]);
  const password = randomBytes(18).toString("base64url");
  const hash = await bcrypt.hash(password, 10);
  await User.create([
    { username: "mobile-admin", role: "ADMIN", password: hash },
    { username: "mobile-resident", flatId: one.id, password: hash },
    { username: "mobile-other", flatId: two.id, password: hash },
  ]);
  const server = createServer(tls, app);
  server.on("error", async error => { console.error(error.code); process.exitCode = 1; await mongoose.disconnect(); });
  server.listen(5443, bind, () => {
    console.log("Synthetic API at https://" + bind + ":5443/api");
    console.log("Accounts: mobile-admin, mobile-resident, mobile-other. Temporary password: " + password);
  });
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => server.close(() => void mongoose.disconnect()));
  }
}
start().catch(async error => {
  console.error(error.message);
  process.exitCode = 1;
  await mongoose.disconnect();
});
