const mongoose = require("mongoose");
const ParkingCycle = require("../models/ParkingCycle");
const ParkingAssignment = require("../models/ParkingAssignment");
const ParkingSlot = require("../models/ParkingSlot");
const Flat = require("../models/Flat");
const Vehicle = require("../models/Vehicle");
const { ApiError } = require("../middleware/apiErrors");

async function lockCycle(cycleId, session) {
  // Writes for the same cycle conflict and retry before checking capacity.
  const result = await ParkingCycle.updateOne(
    { _id: cycleId }, { $inc: { assignmentRevision: 1 } },
    { session, timestamps: false }
  );
  if (!result.matchedCount) throw new ApiError(404, "Parking cycle not found.");
}

function withCycleWrite(cycleId, operation) {
  return mongoose.connection.transaction(async (session) => {
    await lockCycle(cycleId, session);
    return operation(session);
  });
}

async function checkAssignment(cycleId, slot, flatId, session, excludedId) {
  if (!slot || slot.isActive === false) throw new ApiError(404, "Active parking slot not found.");
  const filter = { cycleId, assignmentStatus: "ACTIVE" };
  if (excludedId) filter._id = { $ne: excludedId };
  const count = await ParkingAssignment.countDocuments({ ...filter, slotId: slot._id }).session(session);
  if (count >= slot.maxCapacity) throw new ApiError(409, "Parking slot is full.");
  if (await ParkingAssignment.exists({ ...filter, flatId }).session(session)) {
    throw new ApiError(409, "Flat is already assigned in this cycle.");
  }
}

function parkingTypeFor(slot) {
  return slot.slotType === "OUTSIDE" || slot.side === "OUTSIDE" || slot.slotNumber === "OUTSIDE"
    ? "OUTSIDE" : "INSIDE";
}

async function insertAssignment({ cycleId, flatId, vehicleId, slot, notes }, session) {
  await checkAssignment(cycleId, slot, flatId, session);
  const [assignment] = await ParkingAssignment.create([{
    cycleId, flatId, vehicleId, slotId: slot._id, parkingType: parkingTypeFor(slot), notes,
  }], { session });
  return assignment;
}

function createSingle({ cycleId, slotId, flatId, vehicleId, notes }) {
  return withCycleWrite(cycleId, async (session) => {
    const slot = await ParkingSlot.findById(slotId).session(session);
    const flat = await Flat.findById(flatId).session(session);
    if (!flat || flat.isActive === false) throw new ApiError(404, "Active flat not found.");
    const vehicle = await Vehicle.findOne({ _id: vehicleId, flatId, isActive: true }).session(session);
    if (!vehicle) throw new ApiError(400, "Select an active vehicle belonging to this flat.");
    return insertAssignment({ cycleId, flatId, vehicleId, slot, notes }, session);
  });
}

function createBulk(cycleId, items) {
  return withCycleWrite(cycleId, async (session) => {
    const assignments = [];
    for (const item of items) {
      const slot = await ParkingSlot.findOne({ slotNumber: item.slotNumber }).session(session);
      const flat = await Flat.findOne({ flatNumber: item.flatNumber }).session(session);
      if (!flat || flat.isActive === false) throw new ApiError(404, "Active flat not found.");
      const vehicle = await Vehicle.findOne({ flatId: flat._id, isActive: true })
        .sort({ createdAt: 1, _id: 1 }).session(session);
      if (!vehicle) throw new ApiError(400, "An imported flat has no active vehicle.");
      assignments.push(await insertAssignment({
        cycleId, flatId: flat._id, vehicleId: vehicle._id, slot,
      }, session));
    }
    return assignments;
  });
}

async function updateSlot(assignmentId, slotId) {
  const existing = await ParkingAssignment.findById(assignmentId).select("cycleId");
  if (!existing) throw new ApiError(404, "Assignment not found.");
  return withCycleWrite(existing.cycleId, async (session) => {
    const assignment = await ParkingAssignment.findById(assignmentId).session(session);
    if (!assignment) throw new ApiError(404, "Assignment not found.");
    const slot = await ParkingSlot.findById(slotId).session(session);
    if (!slot || slot.isActive === false) throw new ApiError(404, "Active parking slot not found.");
    if (assignment.assignmentStatus === "ACTIVE") {
      await checkAssignment(assignment.cycleId, slot, assignment.flatId, session, assignment._id);
    }
    assignment.slotId = slot._id;
    assignment.parkingType = parkingTypeFor(slot);
    return assignment.save({ session });
  });
}

module.exports = { withCycleWrite, parkingTypeFor, createSingle, createBulk, updateSlot };
