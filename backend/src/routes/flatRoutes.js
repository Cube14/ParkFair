const express = require("express");

const router = express.Router();

const {
  getAllFlats,
  createFlat,
} = require("../controllers/flatController");

router.get("/", getAllFlats);

router.post("/", createFlat);

module.exports = router;