const router = require("express").Router();
const { getHealth, getReadiness } = require("../controllers/healthController");
router.get("/", getHealth);
router.get("/ready", getReadiness);
module.exports = router;
