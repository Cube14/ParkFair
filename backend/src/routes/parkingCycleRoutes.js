const router = require("express").Router();
const { createCycle, getCycles, deleteCycle, updateCycleStatus, completeCycle } =
  require("../controllers/parkingCycleController");
const { cycleFields, oneOf, validateBody, validateCycleDates, validateIds } =
  require("../middleware/validateRequest");
const ScheduledActivation = require("../models/ScheduledActivation");
const { createSchedule, cancelSchedule } = require("../services/scheduledActivation");
const { id } = require("../middleware/validateRequest");

router.post("/:id/activation-schedules", validateIds("id"),
  validateBody({ publicationId: id, approved: (value) => value === true }), async (req, res) => {
    const schedule = await createSchedule(req.params.id, req.body.publicationId, req.user.id);
    res.status(201).json({ success: true, schedule });
  });
router.get("/:id/activation-schedules", validateIds("id"), async (req, res) => {
  const schedules = await ScheduledActivation.find({ cycleId: req.params.id }).sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, schedules });
});
router.delete("/:id/activation-schedules/:jobId", validateIds("id", "jobId"), async (req, res) => {
  const schedule = await cancelSchedule(req.params.id, req.params.jobId, req.user.id);
  res.json({ success: true, schedule });
});

const status = oneOf("PLANNED", "ACTIVE", "COMPLETED");

router.post("/", validateBody(cycleFields, { status }), validateCycleDates, createCycle);
router.get("/", getCycles);
router.put("/:id/status", validateIds("id"), validateBody({ status }), updateCycleStatus);
router.delete("/:id", validateIds("id"), deleteCycle);
router.put("/:id/complete", validateIds("id"), completeCycle);
module.exports = router;
