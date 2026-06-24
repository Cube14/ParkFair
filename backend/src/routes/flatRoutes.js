
const express = require("express");

const router = express.Router();

const {
  getAllFlats,
  createFlat,
  getFlatHistory,
  updateFlat,
  deleteFlat,
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
router.put("/:id", updateFlat);
router.delete("/:id", deleteFlat);

module.exports = router;