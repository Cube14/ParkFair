const DOMAIN = "SIDDHA_A";
const TEST_LABEL = "OUT-5";
const FLEX = new Set([1, 2, 5, 6]);

function slotLabel(value) {
  const label = typeof value === "string" ? value.trim() : "";
  return /^(?:SLOT [1-8][AB]?|OUT-[1-5])$/i.test(label) ? label.toUpperCase() : label;
}

function layoutRecords() {
  const internal = Array.from({ length: 8 }, (_, i) => i + 1).flatMap(number => {
    const physicalSlotNumber = `SLOT ${number}`;
    return (FLEX.has(number) ? ["FULL", "A", "B"] : ["SINGLE"]).map(position => ({
      slotNumber: physicalSlotNumber + (["A", "B"].includes(position) ? position : ""),
      physicalSlotNumber, position, side: number <= 6 ? "A" : "B", displayOrder: number * 10 + (position === "A" ? 1 : position === "B" ? 2 : 0),
    }));
  });
  const outdoor = Array.from({ length: 5 }, (_, i) => ({ slotNumber: `OUT-${i + 1}`, physicalSlotNumber: `OUT-${i + 1}`,
    position: i === 4 ? "TEST" : "SINGLE", side: "OUTSIDE", slotType: "OUTSIDE", displayOrder: 100 + i }));
  return [...internal, ...outdoor].map(slot => ({ ...slot, domain: DOMAIN, maxCapacity: 1, isActive: true }));
}

const reserved = new Set(layoutRecords().map(slot => slot.slotNumber));
const isTestSlot = slot => slot?.position === "TEST" || slotLabel(slot?.slotNumber) === TEST_LABEL;
const usesSiddha = slots => slots.some(slot => slot.domain === DOMAIN && slot.isActive !== false);
const isReal = (slot, managed) => !!slot && slot.isActive !== false && !isTestSlot(slot) && (!managed || slot.domain === DOMAIN);
const parkingTypeFor = slot => slot.slotType === "OUTSIDE" || slot.side === "OUTSIDE" || slot.slotNumber === "OUTSIDE" ? "OUTSIDE" : "INSIDE";
const placement = slot => slot.domain === DOMAIN ? { physicalSlotNumber: slot.physicalSlotNumber, slotPosition: slot.position } : {};

function compatibility(slot, vehicle, managed) {
  if (isTestSlot(slot)) return ["TEST_POSITION", "OUT-5 is an administrator test position and cannot be assigned."];
  if (managed && slot.domain !== DOMAIN) return ["RETIRED_POSITION", "Choose a Siddha-A parking position from inventory."];
  if (slot.domain !== DOMAIN || !vehicle) return null;
  if (vehicle.vehicleType !== "CAR" || !["SMALL", "BIG"].includes(vehicle.size)) {
    return ["VEHICLE_SIZE_REQUIRED", "Classify this registered car as Small or Big in Vehicles."];
  }
  if (slot.position === "FULL" && vehicle.size !== "BIG") return ["SIZE_INCOMPATIBLE", "Use position A or B for a small car in this tandem slot."];
  if (["A", "B"].includes(slot.position) && vehicle.size !== "SMALL") return ["SIZE_INCOMPATIBLE", "Choose the entire slot for a big car."];
  return null;
}

function occupancyIssue(slot, occupants) {
  if (slot.domain !== DOMAIN) return occupants.length >= slot.maxCapacity ? ["SLOT_CAPACITY", "Parking slot is full."] : null;
  if (occupants.some(item => item.slotPosition === slot.position || String(item.slotId) === String(slot._id))) {
    return ["POSITION_OCCUPIED", "This parking position is already occupied."];
  }
  if (occupants.length && (slot.position === "FULL" || occupants.some(item => item.slotPosition === "FULL"))) {
    return ["TANDEM_CONFLICT", "An entire flex slot and its tandem positions cannot be occupied together."];
  }
  return null;
}

function capacityFor(slots, assignments) {
  const managed = usesSiddha(slots);
  const active = slots.filter(slot => isReal(slot, managed));
  const byId = new Map(active.map(slot => [String(slot._id), slot]));
  const groups = new Map();
  const counts = { INSIDE: { total: 0, occupied: 0, available: 0 }, OUTSIDE: { total: 0, occupied: 0, available: 0 } };
  for (const slot of active) {
    const key = slot.physicalSlotNumber ?? slot.slotNumber;
    const group = groups.get(key) ?? { type: parkingTypeFor(slot), positions: [], occupied: 0, full: false };
    group.positions.push(slot);
    groups.set(key, group);
  }
  for (const row of assignments) {
    const slot = byId.get(String(row.slotId?._id ?? row.slotId));
    if (!slot) continue;
    const group = groups.get(slot.physicalSlotNumber ?? slot.slotNumber);
    group.occupied++;
    if (slot.position === "FULL") group.full = true;
  }
  for (const group of groups.values()) {
    const flex = group.positions.some(slot => ["FULL", "A", "B"].includes(slot.position));
    const split = group.positions.filter(slot => ["A", "B"].includes(slot.position)).length;
    group.total = flex ? group.full ? 1 : Math.max(split, 1) : group.positions.reduce((sum, slot) => sum + slot.maxCapacity, 0);
    counts[group.type].total += group.total;
    counts[group.type].occupied += group.occupied;
  }
  for (const group of Object.values(counts)) group.available = group.total - group.occupied;
  return { counts, groups, managed, active };
}

module.exports = { DOMAIN, TEST_LABEL, layoutRecords, reserved, slotLabel, isTestSlot, usesSiddha, isReal,
  parkingTypeFor, placement, compatibility, occupancyIssue, capacityFor };
