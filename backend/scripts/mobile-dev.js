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
const { setSiddhaInventory } = require("../src/services/siddhaInventory");
const tls = { key: readFileSync(keyPath), cert: readFileSync(certPath), minVersion: "TLSv1.2" };

async function start() {
  const resume = process.env.PARKFAIR_MOBILE_FIXTURE;
  if (resume && !/^parkfair_dev_mobile_[a-f0-9]{16}$/.test(resume)) throw new Error("Invalid fixture database.");
  const database = resume || "parkfair_dev_mobile_" + randomBytes(8).toString("hex");
  await mongoose.connect("mongodb://127.0.0.1:" + mongoPort + "/" + database + "?directConnection=true");
  const hello = await mongoose.connection.db.command({ hello: 1 });
  if (hello.setName !== "parkfair-dev" || !hello.isWritablePrimary) throw new Error("Use the isolated ParkFair development replica set.");
  await Promise.all(Object.values(mongoose.models).map(model => model.init()));
  const password = resume ? null : randomBytes(18).toString("base64url");
  if (resume) {
    if (!await User.exists({ username: "mobile-admin", role: "ADMIN" })) throw new Error("Saved fixture unavailable.");
  } else {
    const siddha = process.env.PARKFAIR_SIDDHA_FIXTURE === "1";
    const flats = await Flat.create((siddha ? ["001", "002", "003"] : ["001", "002"]).map(flatNumber => ({ flatNumber })));
    await Vehicle.create(flats.map((flat, i) => ({ flatId: flat.id, vehicleNumber: "FIX-" + "ABC"[i],
      ...(siddha && { size: i === 2 ? "BIG" : "SMALL" }) })));
    if (siddha) await setSiddhaInventory(true);
    else await Slot.create([
      { slotNumber: "A-12", side: "A", maxCapacity: 1, displayOrder: 1 },
      { slotNumber: "C-03", side: "OUTSIDE", maxCapacity: 2, displayOrder: 2 },
    ]);
    const hash = await bcrypt.hash(password, 10);
    const names = ["mobile-resident", "mobile-other", "mobile-third"];
    await User.create([{ username: "mobile-admin", role: "ADMIN", password: hash },
      ...flats.map((flat, i) => ({ username: names[i], flatId: flat.id, role: "RESIDENT", password: hash }))]);
  }
  const server = createServer(tls, app);
  server.on("error", async error => { console.error(error.code); process.exitCode = 1; await mongoose.disconnect(); });
  server.listen(5443, bind, () => {
    console.log("Synthetic API at https://" + bind + ":5443/api");
    if (password) {
      console.log("Isolated fixture database: " + database);
      console.log("Temporary password: " + password);
    }
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
