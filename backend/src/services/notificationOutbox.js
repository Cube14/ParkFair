const { randomUUID } = require("node:crypto");
const { NotificationOutbox } = require("../models/AllocationWorkflow");
const leaseMs = 30000;
const retryMs = 60000;

// This adapter never reaches a network. The API does not start a delivery worker.
function mockProvider(result) {
  if (!["ACCEPTED", "RETRYABLE", "UNKNOWN", "REJECTED"].includes(result)) throw new TypeError("Invalid mock result.");
  return async () => result;
}

async function dispatchMock(eventId, result, now = new Date()) {
  if (process.env.NODE_ENV !== "test") throw new Error("Mock dispatch is for isolated tests.");
  const send = mockProvider(result);
  const claim = randomUUID();
  const record = await NotificationOutbox.findOneAndUpdate({
    eventId, state: { $in: ["PENDING", "RETRY"] }, nextAttemptAt: { $lte: now },
  }, {
    $set: { state: "CLAIMED", leaseUntil: new Date(+now + leaseMs), claim },
    $inc: { attempts: 1 },
  }, { returnDocument: "after" });
  if (!record) return null;

  const providerResult = await send({ idempotencyKey: record.eventId });
  const state = {
    ACCEPTED: "DELIVERED", RETRYABLE: record.attempts >= 5 ? "FAILED" : "RETRY",
    UNKNOWN: "AMBIGUOUS", REJECTED: "FAILED",
  }[providerResult];
  return NotificationOutbox.findOneAndUpdate({ _id: record._id, state: "CLAIMED", claim }, {
    $set: { state, providerResult, nextAttemptAt: state === "RETRY" ? new Date(+now + retryMs) : now },
    $unset: { leaseUntil: 1, claim: 1 },
  }, { returnDocument: "after" });
}

module.exports = { dispatchMock };
