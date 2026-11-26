const { generateFirstRotation } = require("../services/allocationService");

async function generateRotation(req, res) {
  res.status(201).json({ success: true, data: await generateFirstRotation() });
}

module.exports = { generateRotation };
