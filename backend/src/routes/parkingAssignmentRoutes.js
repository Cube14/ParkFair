const express = require("express");

const router = express.Router();

const {
  createAssignment,
  createBulkAssignments,
  getAssignments,
  resetAssignments,
} = require("../controllers/parkingAssignmentController");
console.log(
  "Parking Assignment Routes Loaded"
);
router.post("/", createAssignment);
router.delete("/reset", resetAssignments);
router.post("/bulk", createBulkAssignments);

router.get("/", getAssignments);

module.exports = router;