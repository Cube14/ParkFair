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

router.post("/bulk", createBulkAssignments);

router.delete("/reset", resetAssignments);

router.get("/", getAssignments);

router.put("/:id", updateAssignment);

router.delete("/:id", deleteAssignment);

module.exports = router;