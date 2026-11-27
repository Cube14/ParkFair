const ParkingSlot = require("../models/ParkingSlot");
const { TEST_LABEL } = require("./siddhaParking");

async function realAssignmentFilter(session = null) {
  const testIds = await ParkingSlot.distinct("_id", { $or: [{ position: "TEST" }, { slotNumber: /^OUT-5$/i }] }).session(session);
  return { slotId: { $nin: testIds }, slotNumber: { $ne: TEST_LABEL } };
}

function visibleAssignments(cycle) {
  const selected = cycle.activePublicationId ??
    (cycle.status === "PLANNED" ? cycle.latestPublicationId : null);
  return {
    cycleId: cycle._id,
    publicationId: selected ?? { $exists: false },
  };
}

module.exports = { visibleAssignments, realAssignmentFilter };
