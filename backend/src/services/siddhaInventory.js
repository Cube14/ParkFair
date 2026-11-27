const { Types } = require("mongoose");
const ParkingSlot = require("../models/ParkingSlot");
const ParkingAssignment = require("../models/ParkingAssignment");
const { parkingWrite } = require("./parkingWrite");
const { DOMAIN, layoutRecords, reserved, slotLabel } = require("./siddhaParking");

function setSiddhaInventory(enabled) {
  return parkingWrite(async session => {
    const existing = await ParkingSlot.find().session(session).lean();
    const managed = existing.filter(slot => slot.domain === DOMAIN);
    if (!enabled) {
      if (await ParkingAssignment.exists({ slotId: { $in: managed.map(slot => slot._id) } }).session(session)) {
        throw new Error("Siddha-A addresses are referenced. Keep them active for the verified cutover history.");
      }
      await ParkingSlot.updateMany({ domain: DOMAIN }, { $set: { isActive: false } }, { session });
      return;
    }
    if (existing.some(slot => slot.domain !== DOMAIN && reserved.has(slotLabel(slot.slotNumber)))) {
      throw new Error("A canonical label already belongs to historical inventory. Resolve the cutover mapping before enabling Siddha-A.");
    }
    const records = layoutRecords();
    const ids = new Map(managed.map(slot => [slot.slotNumber, slot._id]));
    for (const slot of records) if (!ids.has(slot.slotNumber)) ids.set(slot.slotNumber, new Types.ObjectId());
    const writes = records.map(slot => ({ updateOne: {
      filter: { _id: ids.get(slot.slotNumber) },
      update: { $setOnInsert: { ...slot, ...(slot.physicalSlotNumber !== slot.slotNumber && { physicalSlotId: ids.get(slot.physicalSlotNumber) }) },
        $set: { isActive: true } }, upsert: true,
    } }));
    // isActive must only be written by one update operator per MongoDB path.
    for (const write of writes) delete write.updateOne.update.$setOnInsert.isActive;
    await ParkingSlot.bulkWrite(writes, { session });
  });
}

module.exports = { setSiddhaInventory };
