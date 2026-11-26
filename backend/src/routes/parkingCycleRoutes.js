const router = require("express").Router();
const { createCycle, getCycles, deleteCycle, updateCycleStatus, completeCycle } =
  require("../controllers/parkingCycleController");
const { cycleFields, oneOf, validateBody, validateCycleDates, validateIds } =
  require("../middleware/validateRequest");
const status = oneOf("PLANNED", "ACTIVE", "COMPLETED");

router.post("/", validateBody(cycleFields, { status }), validateCycleDates, createCycle);
router.get("/", getCycles);
router.put("/:id/status", validateIds("id"), validateBody({ status }), updateCycleStatus);
router.delete("/:id", validateIds("id"), deleteCycle);
router.put("/:id/complete", validateIds("id"), completeCycle);
module.exports = router;
