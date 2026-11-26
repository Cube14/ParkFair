const ParkingCycle = require("../models/ParkingCycle");
const User = require("../models/User");
const ScheduledActivation = require("../models/ScheduledActivation");
const { parkingWrite, audit } = require("./parkingWrite");
const { setStatusInTransaction } = require("../controllers/parkingCycleController");
const { societyDay } = require("./cycleSelection");
const { ApiError } = require("../middleware/apiErrors");

const runnable = ["PENDING", "RETRY"];
const indiaOffset = 330 * 60000;
const retryDelay = 5 * 60000;
const maxAttempts = 3;

function createSchedule(cycleId, publicationId, actorId, clock = Date.now) {
  return parkingWrite(async (session) => {
    const cycle = await ParkingCycle.findById(cycleId).session(session);
    if (!cycle) throw new ApiError(404, "Cycle not found.");
    if (!cycle.latestPublicationId?.equals(publicationId) || cycle.status !== "PLANNED") {
      throw new ApiError(409, "Schedule the latest publication for a planned cycle.");
    }
    const existing = await ScheduledActivation.findOne({ publicationId }).session(session);
    if (existing && runnable.includes(existing.status)) return existing;
    const now = new Date(clock());
    const dueAt = new Date(Date.parse(cycle.startDate.toISOString().slice(0, 10)) - indiaOffset);
    if (dueAt <= now) throw new ApiError(409, "Choose manual activation for a cycle already effective today.");
    const fields = { approvedBy: actorId, approvedAt: now, dueAt, nextAttemptAt: dueAt, status: "PENDING", attempts: 0 };
    const job = existing ?? new ScheduledActivation({ cycleId, publicationId });
    job.set({ ...fields, lastError: undefined, finishedAt: undefined });
    await job.save({ session });
    await audit(session, { actorId, entityId: job._id, action: "ACTIVATION_SCHEDULED" });
    return job;
  });
}

function cancelSchedule(cycleId, jobId, actorId) {
  return parkingWrite(async (session) => {
    const job = await ScheduledActivation.findOne({ _id: jobId, cycleId }).session(session);
    if (!job) throw new ApiError(404, "Schedule not found.");
    if (job.status === "CANCELLED") return job;
    if (!runnable.includes(job.status)) throw new ApiError(409, "This schedule has finished.");
    job.status = "CANCELLED";
    job.finishedAt = new Date();
    await job.save({ session });
    await audit(session, { actorId, entityId: job._id, action: "ACTIVATION_CANCELLED" });
    return job;
  });
}

async function finalize(job, state, reason, now, session) {
  job.attempts++;
  job.status = state;
  job.lastError = reason;
  if (state === "RETRY") job.nextAttemptAt = new Date(+now + retryDelay);
  else job.finishedAt = now;
  await job.save({ session });
  await audit(session, {
    actorId: job.approvedBy, entityId: job._id, action: `SCHEDULED_ACTIVATION_${state}`,
  });
  return job;
}

async function processJob(id, now) {
  let attempt;
  try {
    return await parkingWrite(async (session) => {
      const job = await ScheduledActivation.findOne({
        _id: id, status: { $in: runnable }, nextAttemptAt: { $lte: now }, dueAt: { $lte: now },
      }).session(session);
      if (!job) return null;
      attempt = job.attempts;
      const cycle = await ParkingCycle.findById(job.cycleId).session(session);
      if (!cycle?.latestPublicationId?.equals(job.publicationId)) {
        return finalize(job, "SUPERSEDED", "PUBLICATION_SUPERSEDED", now, session);
      }
      if (!await User.exists({ _id: job.approvedBy, role: "ADMIN", isActive: { $ne: false } }).session(session)) {
        return finalize(job, "FAILED", "APPROVER_UNAVAILABLE", now, session);
      }
      if (cycle.endDate < societyDay(now) || cycle.status === "COMPLETED") {
        return finalize(job, "FAILED", "CYCLE_CLOSED", now, session);
      }
      await setStatusInTransaction(cycle._id, "ACTIVE", job.approvedBy, session, now);
      return finalize(job, "ACTIVATED", undefined, now, session);
    });
  } catch (error) {
    if (attempt === undefined) throw error;
    return parkingWrite(async (session) => {
      const job = await ScheduledActivation.findOne({ _id: id, status: { $in: runnable }, attempts: attempt }).session(session);
      if (!job) return null;
      return finalize(job, attempt + 1 >= maxAttempts ? "FAILED" : "RETRY",
        error instanceof ApiError ? "ACTIVATION_REVALIDATION" : "TEMPORARY_FAILURE", now, session);
    });
  }
}

// There is no server timer or production runner in this phase.
async function runDueForTesting(clock = Date.now) {
  if (process.env.NODE_ENV !== "test") throw new Error("Scheduled execution is restricted to isolated verification.");
  const now = new Date(clock());
  const due = await ScheduledActivation.find({ status: { $in: runnable }, nextAttemptAt: { $lte: now } })
    .sort({ nextAttemptAt: 1, _id: 1 }).select("_id").limit(25);
  const results = [];
  for (const { _id } of due) {
    const result = await processJob(_id, now);
    if (result) results.push(result);
  }
  return results;
}

module.exports = { createSchedule, cancelSchedule, runDueForTesting };
