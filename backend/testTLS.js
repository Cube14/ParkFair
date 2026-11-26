const dns = require("node:dns").promises;
const tls = require("node:tls");

function probe({ name, port }, version) {
  return new Promise((resolve) => {
    let tcp = false;
    const socket = tls.connect({
      host: name, port, servername: name, minVersion: version, maxVersion: version,
      rejectUnauthorized: true,
    });
    const finish = (outcome) => {
      clearTimeout(timeout);
      socket.destroy();
      resolve({ version, tcp, outcome });
    };
    const timeout = setTimeout(() => finish("timeout"), 6500);
    socket.once("connect", () => { tcp = true; });
    socket.once("secureConnect", () => finish("verified"));
    socket.once("error", (error) => finish(error.code ?? error.name));
  });
}

async function run() {
  const host = process.env.PARKFAIR_ATLAS_HOST;
  if (!host || !/^[a-z0-9][a-z0-9.-]*\.mongodb\.net$/i.test(host)) {
    console.error("Set PARKFAIR_ATLAS_HOST to an Atlas SRV hostname with no credentials.");
    process.exitCode = 1;
    return;
  }
  const servers = await dns.resolveSrv(`_mongodb._tcp.${host}`);
  console.log(`SRV records: ${servers.length}`);
  const outcomes = await Promise.all(servers.flatMap((server, index) =>
    ["TLSv1.2", "TLSv1.3"].map(async (version) => ({ node: index + 1, ...await probe(server, version) }))
  ));
  for (const outcome of outcomes) console.log(JSON.stringify(outcome));
  if (!outcomes.length || outcomes.some(({ outcome }) => outcome !== "verified")) process.exitCode = 1;
}

run().catch((error) => {
  console.error(`DNS probe failed: ${error.code ?? error.name}`);
  process.exitCode = 1;
});
