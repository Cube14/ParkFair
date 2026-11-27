const { capacityFor } = require("./siddhaParking");

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

  const capacity = capacityFor(slots, resolved).counts;

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
