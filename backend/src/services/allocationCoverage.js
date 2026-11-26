const { parkingTypeFor } = require("./assignmentService");

function coverageReport({ flats, vehicles, disabledFlats, slots, resolved, exclusions, issues, issue }) {
  const activeVehicleFlats = new Set(vehicles.filter((vehicle) => vehicle.isActive !== false && vehicle.flatId)
    .map((vehicle) => String(vehicle.flatId)));
  const eligible = flats.filter((flat) => flat.isActive !== false && !disabledFlats.has(String(flat._id)) &&
    activeVehicleFlats.has(String(flat._id)));
  const eligibleByNumber = new Map(eligible.map((flat) => [flat.flatNumber, flat]));
  const assigned = new Set(resolved.map((row) => row.flatNumber));
  const excluded = new Map();
  for (const { flatNumber, reason } of exclusions ?? []) {
    if (!eligibleByNumber.has(flatNumber) || assigned.has(flatNumber) || excluded.has(flatNumber) || !reason) {
      issues.push(issue(null, "exclusions", "INVALID_EXCLUSION",
        "Exclude each eligible, unassigned flat at most once and provide a reason."));
    } else {
      excluded.set(flatNumber, reason);
    }
  }

  const unassigned = eligible.map((flat) => flat.flatNumber)
    .filter((number) => !assigned.has(number) && !excluded.has(number)).sort();
  if (unassigned.length) issues.push(issue(null, "coverage", "INCOMPLETE_COVERAGE",
    "Assign every eligible flat or record and review an explicit exclusion."));

  const capacity = {
    INSIDE: { total: 0, occupied: 0, available: 0 },
    OUTSIDE: { total: 0, occupied: 0, available: 0 },
  };
  for (const slot of slots) {
    if (slot.isActive !== false && Number.isSafeInteger(slot.maxCapacity) && slot.maxCapacity >= 0) {
      capacity[parkingTypeFor(slot)].total += slot.maxCapacity;
    }
  }
  for (const assignment of resolved) capacity[assignment.parkingType].occupied++;
  for (const group of Object.values(capacity)) group.available = group.total - group.occupied;

  const referenceCodes = new Set(["REQUIRED", "UNKNOWN_FLAT", "UNKNOWN_SLOT", "UNKNOWN_VEHICLE", "INACTIVE_RESIDENT",
    "INACTIVE_SLOT", "INACTIVE_VEHICLE", "VEHICLE_OWNERSHIP", "AMBIGUOUS_VEHICLE", "NO_ACTIVE_VEHICLE"]);
  return {
    totalEligibleFlats: eligible.length,
    totalAssignedFlats: assigned.size,
    unassignedEligibleFlats: unassigned,
    excludedFlats: [...excluded].sort(([a], [b]) => a.localeCompare(b)).map(([flatNumber, reason]) => ({ flatNumber, reason })),
    assignedVehicles: resolved.map(({ flatNumber, vehicleNumber }) => ({ flatNumber, vehicleNumber })),
    unresolvedReferences: issues.filter((entry) => referenceCodes.has(entry.code)),
    capacity,
  };
}

module.exports = { coverageReport };
