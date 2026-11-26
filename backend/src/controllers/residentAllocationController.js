const ParkingCycle = require("../models/ParkingCycle");
const ParkingAssignment = require("../models/ParkingAssignment");
const { AllocationPublication } = require("../models/AllocationWorkflow");
const { currentCycle, societyDay, dayAfter } = require("../services/cycleSelection");
const { visibleAssignments } = require("../services/assignmentVisibility");
const { ApiError } = require("../middleware/apiErrors");

async function assignmentQuery(filter) {
  return ParkingAssignment.find(filter).sort({ _id: 1 })
    .populate("slotId", "slotNumber side")
    .populate("vehicleId", "vehicleNumber vehicleType")
    .populate("cycleId", "cycleName startDate endDate")
    .populate("publicationId", "sequence activatedAt startDate endDate")
    .lean();
}

function project(row) {
  return {
    cycle: { id: row.cycleId?._id, name: row.cycleId?.cycleName,
      startDate: row.publicationId?.startDate ?? row.cycleId?.startDate,
      endDate: row.publicationId?.endDate ?? row.cycleId?.endDate },
    publication: row.publicationId ? {
      id: row.publicationId._id, sequence: row.publicationId.sequence, activatedAt: row.publicationId.activatedAt,
    } : null,
    parking: { type: row.parkingType, slot: row.slotNumber ?? row.slotId?.slotNumber ?? null },
    vehicle: { id: row.vehicleId?._id ?? null, number: row.vehicleNumber ?? row.vehicleId?.vehicleNumber ?? null },
  };
}

function requireFlat(req) {
  if (!req.user.flatId) throw new ApiError(404, "Resident has no flat assigned.");
  return req.user.flatId;
}

async function upcomingRows(flatId) {
  const today = societyDay();
  const cycles = await ParkingCycle.find({
    status: { $in: ["PLANNED", "ACTIVE"] },
    startDate: { $gte: dayAfter(today) }, latestPublicationId: { $exists: true },
  }).sort({ startDate: 1, _id: 1 }).limit(100).lean();
  const results = await assignmentQuery({
    flatId, publicationId: { $in: cycles.map((cycle) => cycle.latestPublicationId) },
  });
  const byCycle = new Map(results.map((result) => [String(result.cycleId?._id), result]));
  return cycles.flatMap((cycle) => {
    const row = byCycle.get(String(cycle._id));
    return row ? [project(row)] : [];
  });
}

async function getSchedule(req, res) {
  const flatId = requireFlat(req);
  const cycle = await currentCycle();
  const current = cycle ? await assignmentQuery({ flatId, ...visibleAssignments(cycle), assignmentStatus: "ACTIVE" }) : [];
  const upcoming = await upcomingRows(flatId);
  res.json({ success: true, current: current[0] ? project(current[0]) : null, next: upcoming[0] ?? null, upcoming });
}

async function getHistory(req, res) {
  const flatId = requireFlat(req);
  const cycles = await ParkingCycle.find({
    $or: [{ status: "COMPLETED" }, { status: "ACTIVE", endDate: { $lt: societyDay() } },
      { status: "ACTIVE", activePublicationId: { $exists: true } }],
  }).select("_id activePublicationId legacySupersededAt status endDate").lean();
  const prior = await AllocationPublication.find({
    cycleId: { $in: cycles.map(({ _id }) => _id) }, activatedAt: { $exists: true },
  }).select("_id cycleId").lean();
  const time = societyDay();
  const stillEffective = new Set(cycles.filter((cycle) => cycle.status === "ACTIVE" && cycle.endDate >= time)
    .map((cycle) => String(cycle.activePublicationId)));
  const filter = {
    flatId,
    $or: [{
      cycleId: { $in: cycles.filter((cycle) => cycle.status === "COMPLETED" || cycle.endDate < time || cycle.legacySupersededAt).map(({ _id }) => _id) },
      publicationId: { $exists: false }, assignmentStatus: { $in: ["ACTIVE", "COMPLETED"] },
    }, { publicationId: { $in: prior.filter((pub) => !stillEffective.has(String(pub._id))).map(({ _id }) => _id) } }],
  };
  const rows = (await assignmentQuery(filter)).filter((row) => row.cycleId).map(project);
  rows.sort((a, b) => +new Date(b.cycle.startDate) - +new Date(a.cycle.startDate) ||
    (b.publication?.sequence ?? 0) - (a.publication?.sequence ?? 0));
  res.json({ success: true, history: rows.slice(0, 100) });
}

module.exports = { getSchedule, getHistory };
