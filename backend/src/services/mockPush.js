const { createHash } = require("node:crypto");
const User = require("../models/User");
const Cycle = require("../models/ParkingCycle");
const { AuthSession } = require("../models/AuthSession");
const { NotificationOutbox } = require("../models/AllocationWorkflow");
const { PushInstallation, ResidentInbox } = require("../models/PushFoundation");
const { parkingWrite } = require("./parkingWrite");
const { currentCycle } = require("./cycleSelection");
const { ApiError } = require("../middleware/apiErrors");

function requireMockMode() {
  if (process.env.NODE_ENV !== "test") throw new ApiError(503, "Push registration and dispatch are disabled.");
}

function registerSynthetic(user, { installationId, platform, token }) {
  requireMockMode();
  if (!user.sessionId) throw new ApiError(401, "An installation session is required.");
  return parkingWrite(async (session) => {
    const family = await AuthSession.findOne({
      _id: user.sessionId, userId: user.id, client: "native", revokedAt: null, expiresAt: { $gt: new Date() },
    }).session(session);
    if (!family) throw new ApiError(401, "An installation session is required.");
    // Lock the family so registration and revocation cannot cross each other.
    family.lastUsedAt = new Date();
    await family.save({ session });
    const existing = await PushInstallation.findOne({ installationId }).session(session);
    if (existing && (!existing.userId.equals(user.id) || !existing.sessionId.equals(family._id))) {
      throw new ApiError(409, "The installation is linked to another session.");
    }
    const installation = existing ?? new PushInstallation({ installationId });
    installation.set({
      userId: user.id, sessionId: family._id, platform, expiresAt: family.expiresAt,
      digest: createHash("sha256").update(token).digest("hex"),
    });
    await installation.save({ session });
    return installation.installationId;
  });
}

function dispatchSynthetic(eventId, actorId, now = new Date()) {
  requireMockMode();
  return parkingWrite(async (session) => {
    if (!await User.exists({ _id: actorId, role: "ADMIN", isActive: { $ne: false } }).session(session)) {
      throw new ApiError(403, "Dispatch requires an active administrator.");
    }
    const job = await NotificationOutbox.findOne({ eventId, state: "PENDING" }).session(session);
    if (!job) return null;
    const publishedCycle = await Cycle.findOne({
      $or: [{ latestPublicationId: job.publicationId }, { activePublicationId: job.publicationId }],
    }).session(session);
    if (!publishedCycle?.latestPublicationId?.equals(job.publicationId)) {
      job.state = "FAILED";
      job.providerResult = "REJECTED";
      await job.save({ session });
      return { state: "SUPERSEDED", installations: 0 };
    }
    const effective = await currentCycle(now).session(session);
    if (!effective?.activePublicationId?.equals(job.publicationId)) return null;

    const recipients = await User.find({ flatId: job.flatId, role: "RESIDENT", isActive: { $ne: false } })
      .select("_id").session(session);
    let installs = 0;
    for (const user of recipients) {
      await ResidentInbox.updateOne({ userId: user._id, eventId }, {
        $setOnInsert: { publicationId: job.publicationId, kind: "PARKING_UPDATED" },
      }, { upsert: true, session });
      const liveFamilies = await AuthSession.find({
        userId: user._id, revokedAt: null, expiresAt: { $gt: now },
      }).select("_id").session(session);
      installs += await PushInstallation.countDocuments({
        userId: user._id, sessionId: { $in: liveFamilies.map((family) => family._id) }, expiresAt: { $gt: now },
      }).session(session);
    }
    job.state = "DELIVERED";
    job.providerResult = "ACCEPTED";
    job.attempts++;
    await job.save({ session });
    return { state: "DELIVERED", installations: installs };
  });
}

module.exports = { registerSynthetic, dispatchSynthetic };
