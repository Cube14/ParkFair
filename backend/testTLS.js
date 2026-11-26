const tls = require("tls");

const hosts = [
  "ac-zo6srhj-shard-00-00.swz91yf.mongodb.net",
  "ac-zo6srhj-shard-00-01.swz91yf.mongodb.net",
  "ac-zo6srhj-shard-00-02.swz91yf.mongodb.net",
];

const versions = ["TLSv1.2", "TLSv1.3"];

async function testTLS(host, version) {
  return new Promise((resolve) => {
    console.log(`\nTesting ${host} using ${version}...`);

    const socket = tls.connect({
      host,
      port: 27017,
      servername: host,
      minVersion: version,
      maxVersion: version,
      rejectUnauthorized: true,
    });

    socket.setTimeout(10000);

    socket.once("secureConnect", () => {
      console.log("✅ SUCCESS");
      console.log("Negotiated:", socket.getProtocol());
      console.log("Authorized:", socket.authorized);
      socket.end();
      resolve();
    });

    socket.once("error", (error) => {
      console.log("❌ FAILED:", error.message);
      resolve();
    });

    socket.once("timeout", () => {
      console.log("❌ TIMEOUT");
      socket.destroy();
      resolve();
    });
  });
}

async function main() {
  for (const host of hosts) {
    for (const version of versions) {
      await testTLS(host, version);
    }
  }
}

main();