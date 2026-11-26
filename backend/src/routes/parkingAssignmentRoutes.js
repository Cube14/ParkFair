const router = require("express").Router();
const {
  createAssignment, createBulkAssignments, getAssignments, resetAssignments, updateAssignment, deleteAssignment,
} = require("../controllers/parkingAssignmentController");
const requireDevReset = require("../middleware/requireDevReset");
const { id, oneOf, optionalText, text, validateBody, validateIds } = require("../middleware/validateRequest");

const bulkEntries = (items) => Array.isArray(items) && items.length > 0 && items.length <= 250 &&
  items.every((item) => item && Object.keys(item).length === 2 && text(item.slotNumber) && text(item.flatNumber));

router.get("/", getAssignments);
router.post("/", validateBody({ cycleId: id, slotId: id, flatId: id, vehicleId: id }, {
  parkingType: oneOf("INSIDE", "OUTSIDE"), notes: optionalText,
}), createAssignment);
router.post("/bulk", validateBody({ cycleId: id, assignments: bulkEntries }), createBulkAssignments);
router.delete("/reset", requireDevReset, resetAssignments);
router.put("/:id", validateIds("id"), validateBody({ slotId: id }), updateAssignment);
router.delete("/:id", validateIds("id"), deleteAssignment);
module.exports = router;
