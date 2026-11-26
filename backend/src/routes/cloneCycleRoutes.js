const router = require("express").Router();
const { cloneCycle } = require("../controllers/cloneCycleController");
const { cycleFields, validateBody, validateCycleDates, validateIds } = require("../middleware/validateRequest");
router.post("/:cycleId/clone", validateIds("cycleId"), validateBody(cycleFields), validateCycleDates, cloneCycle);
module.exports = router;
