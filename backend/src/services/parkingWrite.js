const { connection } = require("mongoose");
const { AdminAudit, ParkingWriteFence } = require("../models/AllocationWorkflow");

// One society shares cycle dates, resident eligibility and parking capacity.
async function parkingWrite(operation) {
  const key = { _id: "parking" };
  try {
    await ParkingWriteFence.updateOne(key, { $setOnInsert: { version: 0 } }, { upsert: true });
  } catch (error) {
    if (error.code !== 11000) throw error;
  }
  return connection.transaction(async (session) => {
    await ParkingWriteFence.updateOne(key, { $inc: { version: 1 } }, { session });
    return operation(session);
  });
}

async function audit(session, { actorId, action, entityId, revision, counts, reason }) {
  await AdminAudit.create([{ actorId, action, entityId, revision, counts, reason }], { session });
}

module.exports = { parkingWrite, audit };
