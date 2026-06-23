const express = require("express");

const router = express.Router();

const {
  createAssignment,
  createBulkAssignments,
  getAssignments,
  resetAssignments,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/parkingAssignmentController");
console.log(
  "Parking Assignment Routes Loaded"
);
router.post("/", createAssignment);
router.delete("/:id", deleteAssignment);
router.post("/bulk", createBulkAssignments);
router.put("/:id", updateAssignment);
router.delete("/reset", resetAssignments);
router.get("/", getAssignments);

module.exports = router;