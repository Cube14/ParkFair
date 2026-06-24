const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");
const parkingSlotRoutes = require("./routes/parkingSlotRoutes");
const flatRoutes = require("./routes/flatRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const parkingCycleRoutes = require("./routes/parkingCycleRoutes");
const cycleSummaryRoutes = require("./routes/cycleSummaryRoutes");
const parkingAssignmentRoutes = require("./routes/parkingAssignmentRoutes");
const cycleMatrixRoutes = require("./routes/cycleMatrixRoutes");
const layoutRoutes = require("./routes/layoutRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const cloneCycleRoutes = require("./routes/cloneCycleRoutes");
const allocationRoutes = require(
  "./routes/allocationRoutes"
);
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/flats", flatRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/layouts", layoutRoutes);
app.use("/api/cycles", parkingCycleRoutes);
app.use("/api/assignments", parkingAssignmentRoutes);
app.use("/api/cycles", cycleMatrixRoutes);
app.use("/api/slots", parkingSlotRoutes);
app.use("/api/allocations", allocationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/cycles", cycleSummaryRoutes);
app.use("/api/cycles", cloneCycleRoutes);
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