const ParkingCycle = require("../models/ParkingCycle");
const ParkingAssignment = require("../models/ParkingAssignment");
const Rotation = require("../models/Rotation");
const Allocation = require("../models/Allocation");
const CreditLedger = require("../models/CreditLedger");

function identity(row) {
  return `${row.flatId}:${row.vehicleId}`;
}

function day(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function key(row, start, end) {
  return `${identity(row)}:${day(start)}:${day(end)}`;
}

async function reconcileLegacyFairness() {
  const cycles = await ParkingCycle.find({
    status: "COMPLETED", activePublicationId: { $exists: false },
  }).select("startDate endDate").lean();
  const byCycle = new Map(cycles.map((cycle) => [String(cycle._id), cycle]));
  const [physical, fairness, ledgers, rotations] = await Promise.all([
    ParkingAssignment.find({
      cycleId: { $in: cycles.map((cycle) => cycle._id) }, publicationId: { $exists: false },
      assignmentStatus: { $in: ["ACTIVE", "COMPLETED"] },
    }).select("cycleId flatId vehicleId parkingType").lean(),
    Allocation.find().select("rotationId flatId vehicleId parkingType startDate endDate").lean(),
    CreditLedger.find().select("flatId balanceScore insideRotations outsideRotations").lean(),
    Rotation.find().select("_id").lean(),
  ]);
  const knownRotations = new Set(rotations.map((rotation) => String(rotation._id)));
  const byAssignment = new Map();
  for (const row of physical) {
    const cycle = byCycle.get(String(row.cycleId));
    const assignmentKey = key(row, cycle.startDate, cycle.endDate);
    const group = byAssignment.get(assignmentKey) ?? [];
    group.push(row.parkingType);
    byAssignment.set(assignmentKey, group);
  }

  const matched = new Set();
  let equivalent = 0;
  let typeDifferences = 0;
  let unlinkedFairnessRows = 0;
  let ambiguousFairnessRows = 0;
  for (const row of fairness) {
    const assignmentKey = key(row, row.startDate, row.endDate);
    const physicalTypes = byAssignment.get(assignmentKey) ?? [];
    if (!knownRotations.has(String(row.rotationId)) || !physicalTypes.length) unlinkedFairnessRows++;
    else if (physicalTypes.length > 1) ambiguousFairnessRows++;
    else {
      matched.add(assignmentKey);
      if (physicalTypes[0] === row.parkingType) equivalent++;
      else typeDifferences++;
    }
  }

  return {
    physicalRows: physical.length, fairnessRows: fairness.length, equivalent, typeDifferences,
    unlinkedFairnessRows, ambiguousFairnessRows,
    unmatchedPhysicalRows: [...byAssignment].reduce((count, [id, records]) =>
      count + (matched.has(id) ? 0 : records.length), 0),
    ledgers: ledgers.length,
    inconsistentLegacyScores: ledgers.filter((row) =>
      row.balanceScore !== row.outsideRotations - row.insideRotations).length,
  };
}

module.exports = { reconcileLegacyFairness };
