const mongoose = require("mongoose");

async function run() {
  const port = process.env.PARKFAIR_TEST_MONGO_PORT;
  if (!port || !/^\d{1,5}$/.test(port)) {
    console.error("Set PARKFAIR_TEST_MONGO_PORT to a disposable local replica set port.");
    process.exitCode = 1;
    return;
  }
  try {
    await mongoose.connect(`mongodb://127.0.0.1:${port}/parkfair_probe?directConnection=true`, {
      serverSelectionTimeoutMS: 5000,
    });
    const hello = await mongoose.connection.db.admin().command({ hello: 1 });
    if (!hello.setName || !hello.isWritablePrimary) throw new Error();
    console.log("Disposable MongoDB replica set primary is reachable.");
  } catch {
    console.error("Could not reach a writable local MongoDB replica set.");
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
void run();
