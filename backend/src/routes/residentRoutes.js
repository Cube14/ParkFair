const router = require("express").Router();
const { getResidentDashboard } = require("../controllers/residentController");
router.get("/dashboard", getResidentDashboard);
module.exports = router;
