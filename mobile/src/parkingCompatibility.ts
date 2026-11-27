export type VehicleSize = 'SMALL' | 'BIG';
export type Position = 'FULL' | 'A' | 'B' | 'SINGLE' | 'TEST';
export type ParkingAddress = { slotNumber?: string; physicalSlotNumber?: string; position?: Position };

export function positionDetail(position?: Position) {
  switch (position) {
    case 'FULL': return 'Whole flex slot · Big car';
    case 'A': return 'Inner tandem position · Small car';
    case 'B': return 'Outer tandem position · Small car';
    case 'TEST': return 'Administrator test only · unavailable for allocation';
    default: return 'Small or Big car';
  }
}

export function positionConflict(slot: ParkingAddress, size: VehicleSize | null | undefined, otherLabels: readonly string[]) {
  if (slot.position === 'TEST') return 'Administrator test only';
  if (!slot.position || !slot.slotNumber) return undefined;
  if (size === null) return 'Classify the vehicle before assigning it';
  if (size === 'SMALL' && slot.position === 'FULL') return 'Choose A or B for a Small car';
  if (size === 'BIG' && (slot.position === 'A' || slot.position === 'B')) return 'Choose the whole slot for a Big car';
  const labels = new Set(otherLabels.map(label => label.trim().toUpperCase()));
  if (labels.has(slot.slotNumber)) return 'Position is already used in this chart';
  const physical = slot.physicalSlotNumber;
  if (physical && ((slot.position === 'FULL' && (labels.has(physical + 'A') || labels.has(physical + 'B'))) ||
      ((slot.position === 'A' || slot.position === 'B') && labels.has(physical)))) {
    return 'Whole-slot and tandem assignments conflict';
  }
  return undefined;
}
