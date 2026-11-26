const router = require("express").Router();
const { getAllFlats, createFlat, getFlatHistory, updateFlat, deleteFlat } =
  require("../controllers/flatController");
const { optionalText, text, validateBody, validateIds } = require("../middleware/validateRequest");

const flatDetails = {
  ownerName: optionalText,
  contactNumber: optionalText,
  email: optionalText,
  wing: text,
  floor: Number.isSafeInteger,
  isRegistered: (value) => typeof value === "boolean",
  isActive: (value) => typeof value === "boolean",
};
router.get("/test", (req, res) => res.json({ success: true, message: "Flat route test works" }));
router.get("/", getAllFlats);
router.get("/:flatId/history", validateIds("flatId"), getFlatHistory);
router.post("/", validateBody({ flatNumber: text }, flatDetails), createFlat);
router.put("/:id", validateIds("id"), validateBody({}, { flatNumber: text, ...flatDetails }), updateFlat);
router.delete("/:id", validateIds("id"), deleteFlat);
module.exports = router;
