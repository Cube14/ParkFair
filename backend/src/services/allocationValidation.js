const ParkingCycle = require("../models/ParkingCycle");
const Flat = require("../models/Flat");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");
const Slot = require("../models/ParkingSlot");
const { parkingTypeFor } = require("./assignmentService");
const { societyDay } = require("./cycleSelection");

const day = 86400000;
const issue = (row, field, code, message) => ({ row, field, code, message });
const normalize = (value) => typeof value === "string" ? value.trim().normalize("NFC") : "";

function manualRows(rows) {
  return rows.map(({ flatNumber, slotNumber, vehicleNumber, notes }, i) => ({
    row: i + 2,
    flatNumber: normalize(flatNumber), slotNumber: normalize(slotNumber),
    vehicleNumber: normalize(vehicleNumber).toUpperCase(), notes: normalize(notes),
  }));
}

async function assess(cycle, version, session, now = new Date()) {
  const errors = version.importIssues.map(({ row, field, code, message }) => issue(row, field, code, message));
  const rows = version.rows;
  if (!rows.length) errors.push(issue(null, "rows", "EMPTY_DRAFT", "Add at least one parking row."));
  if (cycle.status === "COMPLETED" || cycle.endDate < societyDay(now) ||
      cycle.endDate < cycle.startDate ||
      Math.floor(+cycle.endDate / day) - Math.floor(+cycle.startDate / day) + 1 !== cycle.durationDays) {
    errors.push(issue(null, "cycle", "INVALID_CYCLE_DATES", "Use an open cycle with a valid inclusive date range."));
  } else {
    const start = new Date(Math.floor(+cycle.startDate / day) * day);
    const end = new Date((Math.floor(+cycle.endDate / day) + 1) * day);
    const overlap = await ParkingCycle.exists({
      _id: { $ne: cycle._id },
      startDate: { $lt: end }, endDate: { $gte: start },
      $or: [{ status: "ACTIVE" }, { latestPublicationId: { $exists: true } }],
    }).session(session);
    if (overlap) errors.push(issue(null, "cycle", "OVERLAPPING_CYCLE", "Choose dates outside the effective or published cycle."));
  }
  const flats = await Flat.find({ flatNumber: { $in: rows.map((r) => r.flatNumber) } }).session(session).lean();
  const slots = await Slot.find({ slotNumber: { $in: rows.map((r) => r.slotNumber) } }).session(session).lean();
  const vehicles = await Vehicle.find({
    $or: [{ flatId: { $in: flats.map((f) => f._id) } },
      { vehicleNumber: { $in: rows.map((r) => r.vehicleNumber) } }],
  }).session(session).lean();
  const accounts = await User.find({
    flatId: { $in: flats.map((f) => f._id) }, role: "RESIDENT",
  }).select("flatId isActive").session(session).lean();

  const flatsByNumber = new Map(flats.map((flat) => [flat.flatNumber, flat]));
  const slotsByNumber = new Map(slots.map((slot) => [slot.slotNumber, slot]));
  const vehiclesByNumber = new Map(vehicles.map((vehicle) => [vehicle.vehicleNumber, vehicle]));
  const firstFlat = new Map();
  const firstVehicle = new Map();
  const occupied = new Map();
  const resolved = [];
  for (const row of rows) {
    const { row: line, flatNumber, slotNumber, vehicleNumber, notes } = row;
    const add = (field, code, message) => errors.push(issue(line, field, code, message));
    const flat = flatsByNumber.get(flatNumber);
    const slot = slotsByNumber.get(slotNumber);

    if (!flatNumber) add("flatNumber", "REQUIRED", "Enter the flat identifier.");
    else if (!flat) add("flatNumber", "UNKNOWN_FLAT", "Choose a flat from the administrator inventory.");
    else if (flat.isActive === false || accounts.some((user) =>
      user.flatId?.equals(flat._id) && user.isActive === false)) {
      add("flatNumber", "INACTIVE_RESIDENT", "Choose an eligible flat with an active resident account, if one exists.");
    }
    if (flatNumber && firstFlat.has(flatNumber)) {
      const first = firstFlat.get(flatNumber);
      const same = first.slotNumber === slotNumber && first.vehicleNumber === vehicleNumber;
      add("flatNumber", same ? "DUPLICATE_ROW" : "DUPLICATE_FLAT", `Review the other assignment on row ${first.row}.`);
    } else if (flatNumber) firstFlat.set(flatNumber, row);

    if (!slotNumber) add("slotNumber", "REQUIRED", "Enter the slot identifier.");
    else if (!slot) add("slotNumber", "UNKNOWN_SLOT", "Choose a configured slot.");
    else if (slot.isActive === false) add("slotNumber", "INACTIVE_SLOT", "Choose an active slot.");
    else {
      const count = (occupied.get(slotNumber) ?? 0) + 1;
      occupied.set(slotNumber, count);
      if (!Number.isInteger(slot.maxCapacity) || slot.maxCapacity < count) {
        add("slotNumber", "SLOT_CAPACITY", "Move an assignment to a slot with available capacity.");
      }
    }

    let vehicle = vehiclesByNumber.get(vehicleNumber);
    if (vehicleNumber && !vehicle) add("vehicleNumber", "UNKNOWN_VEHICLE", "Enter a registered vehicle identifier.");
    if (!vehicleNumber && flat) {
      const candidates = vehicles.filter((item) => item.flatId?.equals(flat._id) && item.isActive !== false);
      if (candidates.length === 1) vehicle = candidates[0];
      else add("vehicleNumber", candidates.length ? "AMBIGUOUS_VEHICLE" : "NO_ACTIVE_VEHICLE",
        "Enter an active vehicle identifier belonging to this flat.");
    }
    if (vehicle && vehicle.isActive === false) add("vehicleNumber", "INACTIVE_VEHICLE", "Choose an active vehicle.");
    if (vehicle && flat && !vehicle.flatId?.equals(flat._id)) {
      add("vehicleNumber", "VEHICLE_OWNERSHIP", "Choose a vehicle belonging to this flat.");
    }
    if (vehicle) {
      const key = String(vehicle._id);
      if (firstVehicle.has(key)) add("vehicleNumber", "DUPLICATE_VEHICLE", `Review row ${firstVehicle.get(key)}.`);
      else firstVehicle.set(key, line);
    }
    if (flat && slot && vehicle) resolved.push({
      flatId: flat._id, slotId: slot._id, vehicleId: vehicle._id, parkingType: parkingTypeFor(slot),
      flatNumber: flat.flatNumber, slotNumber: slot.slotNumber, slotSide: slot.side,
      vehicleNumber: vehicle.vehicleNumber, vehicleType: vehicle.vehicleType, notes,
    });
  }
  return { issues: errors, resolved };
}

module.exports = { assess, issue, manualRows, normalize };
