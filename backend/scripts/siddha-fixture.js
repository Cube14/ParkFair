const mongoose = require("mongoose");
const { setSiddhaInventory } = require("../src/services/siddhaInventory");

async function main() {
  const name = process.env.PARKFAIR_MOBILE_FIXTURE;
  const action = process.argv[2];
  if (process.env.NODE_ENV === "production" || !/^parkfair_dev_mobile_[a-f0-9]{16}$/.test(name ?? "") || !["up", "down"].includes(action)) {
    throw new Error("Provide an isolated mobile fixture database and use up or down.");
  }
  await mongoose.connect(`mongodb://127.0.0.1:27149/${name}?directConnection=true`);
  const hello = await mongoose.connection.db.command({ hello: 1 });
  if (hello.setName !== "parkfair-dev" || !hello.isWritablePrimary) throw new Error("Use the isolated ParkFair replica set.");
  await Promise.all(Object.values(mongoose.models).map(model => model.init()));
  await setSiddhaInventory(action === "up");
  console.log(`Siddha-A fixture migration ${action} completed.`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
