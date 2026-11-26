const bcrypt = require("bcryptjs");

async function run() {
  if (process.stdin.isTTY) throw new Error("Provide the password on standard input.");
  let input = "";
  process.stdin.setEncoding("utf8");
  for await (const chunk of process.stdin) {
    input += chunk;
    if (Buffer.byteLength(input, "utf8") > 74) throw new Error("Password exceeds bcrypt's byte limit.");
  }
  const password = input.replace(/\r?\n$/, "");
  if (!password || Buffer.byteLength(password, "utf8") > 72) throw new Error("Invalid password length.");
  console.log(await bcrypt.hash(password, 12));
}
run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
