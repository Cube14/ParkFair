const bcrypt = require("bcryptjs");
const assert = require("node:assert/strict");

async function run() {
  const sample = "synthetic-check-value";
  const hash = await bcrypt.hash(sample, 4);
  assert.ok(await bcrypt.compare(sample, hash));
  assert.ok(!await bcrypt.compare("incorrect-sample", hash));
  console.log("Synthetic bcrypt check passed.");
}
run().catch(() => {
  console.error("Synthetic bcrypt check failed.");
  process.exitCode = 1;
});
