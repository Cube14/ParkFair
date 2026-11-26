const router = require("express").Router();
const { getResidentDashboard } = require("../controllers/residentController");
const { getSchedule, getHistory } = require("../controllers/residentAllocationController");
router.get("/dashboard", getResidentDashboard);
router.get("/schedule", getSchedule);
router.get("/history", getHistory);
router.use(require('./pushFoundationRoutes'));
module.exports = router;
