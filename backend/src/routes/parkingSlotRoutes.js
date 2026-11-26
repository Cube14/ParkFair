const router = require("express").Router();
const { createSlot, getSlots } = require("../controllers/parkingSlotController");
const { oneOf, positiveInteger, text, validateBody } = require("../middleware/validateRequest");
router.get("/", getSlots);
router.post("/", validateBody({
  slotNumber: text, side: oneOf("A", "B", "OUTSIDE"), displayOrder: Number.isSafeInteger,
}, {
  maxCapacity: positiveInteger, slotType: oneOf("STANDARD", "DOUBLE", "OUTSIDE"),
  isActive: (value) => typeof value === "boolean",
}), createSlot);
module.exports = router;
