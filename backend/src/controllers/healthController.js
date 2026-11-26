const mongoose = require("mongoose");

function getHealth(req, res) {
  res.json({ success: true, status: "ok" });
}

async function getReadiness(req, res) {
  const { connection } = mongoose;
  if (connection.readyState === 1) {
    try {
      const hello = await connection.db.command({ hello: 1 }, { timeoutMS: 1500 });
      if (hello.isWritablePrimary && (hello.setName || hello.msg === "isdbgrid")) {
        return res.json({ success: true, status: "ready" });
      }
    } catch {
      // The readiness response stays independent of driver details.
    }
  }
  res.status(503).json({ success: false, status: "unavailable" });
}

module.exports = { getHealth, getReadiness };
