const localDevelopment = process.env.npm_lifecycle_event === "dev";
require("dotenv").config({ path: localDevelopment ? ".env.development" : ".env", quiet: true });
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const validateEnv = require("./config/env");

async function start() {
  let port;
  try {
    port = validateEnv(process.env, { localDevelopment });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  try {
    const { connection } = await connectDB();
    const hello = await connection.db.command({ hello: 1 }, { timeoutMS: 3000 });
    if (!hello.isWritablePrimary || (!hello.setName && hello.msg !== "isdbgrid")) {
      console.error("ParkFair requires a writable MongoDB replica set or sharded cluster.");
      process.exitCode = 1;
      await mongoose.disconnect();
      return;
    }
    const app = require("./app");
    const server = app.listen(port, () => console.log("ParkFair API listening."));
    server.on("error", async () => {
      console.error("ParkFair API could not bind its listener.");
      process.exitCode = 1;
      await mongoose.disconnect();
    });
    for (const signal of ["SIGINT", "SIGTERM"]) {
      process.once(signal, () => server.close(() => void mongoose.disconnect()));
    }
  } catch (error) {
    console.error(JSON.stringify({ event: "startup_failed", category: error.constructor.name }));
    process.exitCode = 1;
    await mongoose.disconnect();
  }
}
void start();
