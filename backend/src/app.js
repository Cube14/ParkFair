const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");
const flatRoutes = require("./routes/flatRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/flats", flatRoutes);
app.use("/api/vehicles", vehicleRoutes);

// Root Route
app.get("/", (req, res) => {
  res.status(200).json({
    project: "ParkFair",
    version: "1.0.0",
    status: "Running",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;