const router = require("express").Router();
const { getAllVehicles, createVehicle, updateVehicle, deleteVehicle } = require("../controllers/vehicleController");
const { id, oneOf, text, validateBody, validateIds } = require("../middleware/validateRequest");
const vehicleType = oneOf("CAR", "BIKE", "OTHER");

router.get("/", getAllVehicles);
router.post("/", validateBody({ vehicleNumber: text, flatId: id }, { vehicleType }), createVehicle);
router.put("/:id", validateIds("id"), validateBody({}, {
  vehicleNumber: text, flatId: id, vehicleType, isActive: (value) => typeof value === "boolean",
}), updateVehicle);
router.delete("/:id", validateIds("id"), deleteVehicle);
module.exports = router;
