const { parkingWrite } = require("./parkingWrite");
const { AllocationDraft } = require("../models/AllocationWorkflow");
const ParkingCycle = require("../models/ParkingCycle");
const ParkingAssignment = require("../models/ParkingAssignment");
const ParkingSlot = require("../models/ParkingSlot");
const Flat = require("../models/Flat");
const Vehicle = require("../models/Vehicle");
const { ApiError } = require("../middleware/apiErrors");
const { DOMAIN, compatibility, occupancyIssue, parkingTypeFor, placement, slotLabel } = require("./siddhaParking");

async function lockCycle(cycleId, session) {
  // Writes for the same cycle conflict and retry before checking capacity.
  const result = await ParkingCycle.updateOne(
    { _id: cycleId }, { $inc: { assignmentRevision: 1 } },
    { session, timestamps: false }
  );
  if (!result.matchedCount) throw new ApiError(404, "Parking cycle not found.");
}

function withCycleWrite(cycleId, operation) {
  return parkingWrite(async (session) => {
    await lockCycle(cycleId, session);
    return operation(session);
  });
}

async function requireLegacyStaging(cycleId, session) {
  const cycle = await ParkingCycle.findById(cycleId).session(session);
  if (cycle?.status !== "PLANNED" || cycle.latestPublicationId ||
      await AllocationDraft.exists({ cycleId }).session(session)) {
    throw new ApiError(409, "Edit an allocation draft and publish it to change effective parking.");
  }
}

async function checkAssignment(cycleId, slot, flatId, vehicle, session, excludedId) {
  if (!slot || slot.isActive === false) throw new ApiError(404, "Active parking slot not found.");
  const managed = !!await ParkingSlot.exists({ domain: DOMAIN, isActive: true }).session(session);
  const problem = compatibility(slot, vehicle, managed);
  if (problem) throw new ApiError(409, problem[1]);
  const filter = { cycleId, assignmentStatus: "ACTIVE" };
  if (excludedId) filter._id = { $ne: excludedId };
  const siblings = slot.domain === DOMAIN ? await ParkingSlot.distinct("_id", {
    domain: DOMAIN, physicalSlotNumber: slot.physicalSlotNumber,
  }).session(session) : [slot._id];
  const occupants = await ParkingAssignment.find({ ...filter, slotId: { $in: siblings } }).select("slotId slotPosition").session(session);
  const normalized = occupants.map(item => ({ slotId: item.slotId,
    slotPosition: item.slotPosition ?? (slot.domain === DOMAIN && String(item.slotId) === String(slot.physicalSlotId) ? "FULL" : undefined) }));
  const conflict = occupancyIssue(slot, normalized);
  if (conflict) throw new ApiError(409, conflict[1]);
  if (await ParkingAssignment.exists({ ...filter, flatId }).session(session)) {
    throw new ApiError(409, "Flat is already assigned in this cycle.");
  }
}

const assignmentFields = (slot, vehicle) => ({ slotId: slot._id, parkingType: parkingTypeFor(slot),
  ...(slot.domain === DOMAIN && { ...placement(slot), slotNumber: slot.slotNumber, slotSide: slot.side, vehicleSize: vehicle.size }) });

async function insertAssignment({ cycleId, flatId, vehicle, slot, notes }, session) {
  if (!vehicle || vehicle.isActive === false || String(vehicle.flatId) !== String(flatId)) {
    throw new ApiError(409, "Select an active vehicle belonging to this flat.");
  }
  await checkAssignment(cycleId, slot, flatId, vehicle, session);
  const [assignment] = await ParkingAssignment.create([{
    cycleId, flatId, vehicleId: vehicle._id, ...assignmentFields(slot, vehicle), notes,
  }], { session });
  return assignment;
}

function createSingle({ cycleId, slotId, flatId, vehicleId, notes }) {
  return withCycleWrite(cycleId, async (session) => {
    await requireLegacyStaging(cycleId, session);
    const slot = await ParkingSlot.findById(slotId).session(session);
    const flat = await Flat.findById(flatId).session(session);
    if (!flat || flat.isActive === false) throw new ApiError(404, "Active flat not found.");
    const vehicle = await Vehicle.findOne({ _id: vehicleId, flatId, isActive: true }).session(session);
    if (!vehicle) throw new ApiError(400, "Select an active vehicle belonging to this flat.");
    return insertAssignment({ cycleId, flatId, vehicle, slot, notes }, session);
  });
}

function createBulk(cycleId, items) {
  return withCycleWrite(cycleId, async (session) => {
    await requireLegacyStaging(cycleId, session);
    const assignments = [];
    for (const item of items) {
      const slot = await ParkingSlot.findOne({ slotNumber: slotLabel(item.slotNumber) }).session(session);
      const flat = await Flat.findOne({ flatNumber: item.flatNumber }).session(session);
      if (!flat || flat.isActive === false) throw new ApiError(404, "Active flat not found.");
      const candidates = await Vehicle.find({ flatId: flat._id, isActive: true,
        ...(item.vehicleNumber && { vehicleNumber: item.vehicleNumber.trim().toUpperCase() }),
      }).sort({ createdAt: 1, _id: 1 }).limit(2).session(session);
      if (slot?.domain === DOMAIN && candidates.length > 1) throw new ApiError(409, "Specify the registered vehicle for this flat.");
      const [vehicle] = candidates;
      if (!vehicle) throw new ApiError(400, "An imported flat has no active vehicle.");
      assignments.push(await insertAssignment({
        cycleId, flatId: flat._id, vehicle, slot,
      }, session));
    }
    return assignments;
  });
}

async function updateSlot(assignmentId, slotId) {
  const existing = await ParkingAssignment.findById(assignmentId).select("cycleId");
  if (!existing) throw new ApiError(404, "Assignment not found.");
  return withCycleWrite(existing.cycleId, async (session) => {
    await requireLegacyStaging(existing.cycleId, session);
    const assignment = await ParkingAssignment.findById(assignmentId).session(session);
    if (!assignment) throw new ApiError(404, "Assignment not found.");
    const slot = await ParkingSlot.findById(slotId).session(session);
    if (!slot || slot.isActive === false) throw new ApiError(404, "Active parking slot not found.");
    const vehicle = await Vehicle.findById(assignment.vehicleId).session(session);
    if (!vehicle || vehicle.isActive === false) throw new ApiError(409, "Select an active vehicle.");
    await checkAssignment(assignment.cycleId, slot, assignment.flatId, vehicle, session, assignment._id);
    assignment.set({ slotNumber: undefined, slotSide: undefined, physicalSlotNumber: undefined, slotPosition: undefined,
      vehicleSize: undefined, ...assignmentFields(slot, vehicle) });
    return assignment.save({ session });
  });
}

module.exports = { withCycleWrite, requireLegacyStaging, parkingTypeFor, createSingle, createBulk, updateSlot, insertAssignment };
