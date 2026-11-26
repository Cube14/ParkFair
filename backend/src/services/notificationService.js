const { visibleAssignments } = require("./assignmentVisibility");
const { setTimeout: delay } = require("node:timers/promises");
const Flat = require("../models/Flat");
const ParkingAssignment = require("../models/ParkingAssignment");
const { ApiError } = require("../middleware/apiErrors");
const { notificationCycle, formatCycleDate } = require("./cycleSelection");
const { sendMessage } = require("./whatsappService");

function notificationFor(assignment, cycle) {
  const { flatId: flat, vehicleId: vehicle, slotId: slot, parkingType } = assignment;
  if (!flat || !vehicle || (!slot && parkingType !== "OUTSIDE")) {
    throw new ApiError(422, "Assignment references a missing flat, vehicle or slot.");
  }
  const start = formatCycleDate(cycle.startDate);
  const end = formatCycleDate(cycle.endDate);
  const slotDisplay = parkingType === "OUTSIDE" ? "Outside Parking Area" : slot.slotNumber;
  return {
    flat: flat.flatNumber,
    owner: flat.ownerName,
    phone: flat.contactNumber,
    parking: parkingType,
    slot: slotDisplay,
    vehicle: vehicle.vehicleNumber,
    message: `*SIDDH-A Society*

Dear *${flat.ownerName}*,

Please use the parking location below from ${start} through ${end}.

*Flat* ${flat.flatNumber}
*Vehicle* ${vehicle.vehicleNumber}
*Parking type* ${parkingType}
*Assigned slot* ${slotDisplay}
*Cycle* ${cycle.cycleName}

If you notice a discrepancy, please contact the society administrator.

_ParkFair automated notification_`,
  };
}

async function getNotificationBatch(cycleId, flatNumber) {
  const cycle = await notificationCycle(cycleId);
  const filter = { ...visibleAssignments(cycle), assignmentStatus: "ACTIVE" };
  if (flatNumber) {
    const flat = await Flat.findOne({ flatNumber });
    if (!flat) throw new ApiError(404, "Flat not found.");
    filter.flatId = flat._id;
  }
  const assignments = await ParkingAssignment.find(filter)
    .populate("flatId", "flatNumber ownerName contactNumber")
    .populate("vehicleId", "vehicleNumber").populate("slotId", "slotNumber")
    .sort({ createdAt: 1, _id: 1 });
  return { cycle, assignments };
}

async function previewActiveCycleNotifications(cycleId) {
  const { cycle, assignments } = await getNotificationBatch(cycleId);
  const data = [];
  const errors = [];
  for (const assignment of assignments) {
    try {
      data.push(notificationFor(assignment, cycle));
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      errors.push({ flat: assignment.flatId?.flatNumber ?? null, reason: error.message });
    }
  }
  return { success: true, cycleId: cycle._id, total: data.length, data, errors };
}

async function sendActiveCycleNotifications(cycleId, flatNumber) {
  const { cycle, assignments } = await getNotificationBatch(cycleId, flatNumber);
  if (!assignments.length) throw new ApiError(404, "No parking assignments found.");
  const errors = [];
  let sent = 0;
  for (const [index, assignment] of assignments.entries()) {
    try {
      const notification = notificationFor(assignment, cycle);
      await sendMessage(notification.phone, notification.message);
      sent++;
      if (index < assignments.length - 1) await delay(5000);
    } catch (error) {
      if (flatNumber) throw error;
      errors.push({
        flat: assignment.flatId?.flatNumber ?? null,
        reason: error instanceof ApiError ? error.message : "WhatsApp delivery failed.",
      });
    }
  }
  return {
    success: errors.length === 0, cycle: cycle.cycleName, cycleId: cycle._id,
    total: assignments.length, sent, failed: errors.length, errors,
  };
}

module.exports = { sendActiveCycleNotifications, previewActiveCycleNotifications };
