const ParkingCycle = require("../models/ParkingCycle");
const { ApiError } = require("../middleware/apiErrors");

const dayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" });
const displayFormat = new Intl.DateTimeFormat("en-IN", {
  timeZone: "UTC", day: "2-digit", month: "short", year: "numeric",
});
const dayMs = 24 * 60 * 60 * 1000;

function societyDay(now = new Date()) {
  return new Date(`${dayFormat.format(now)}T00:00:00.000Z`);
}

const dayAfter = (date) => new Date(+date + dayMs);

function currentCycle(now = new Date()) {
  const today = societyDay(now);
  return ParkingCycle.findOne({
    status: "ACTIVE",
    startDate: { $lt: dayAfter(today) },
    endDate: { $gte: today },
  }).sort({ startDate: -1, _id: 1 });
}

async function notificationCycle(cycleId) {
  const cycle = cycleId
    ? await ParkingCycle.findOne({ _id: cycleId, status: { $in: ["ACTIVE", "PLANNED"] } })
    : await currentCycle();
  if (!cycle) throw new ApiError(404, "No eligible parking cycle found.");
  return cycle;
}

function remainingDays(endDate, now = new Date()) {
  return Math.max(0, Math.floor((new Date(endDate) - societyDay(now)) / dayMs));
}

module.exports = {
  currentCycle, notificationCycle, remainingDays, societyDay, dayAfter, formatCycleDate: (value) => displayFormat.format(value),
};
