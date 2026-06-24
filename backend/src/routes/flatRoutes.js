console.log(
  "🔥 FLAT ROUTES LOADED"
);
const express = require("express");

const router = express.Router();

const {
  getAllFlats,
  createFlat,
  getFlatHistory,
} = require("../controllers/flatController");

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Flat route test works"
  });
});

router.get("/", getAllFlats);
router.get("/:flatId/history", getFlatHistory);
router.post("/", createFlat);

module.exports = router;