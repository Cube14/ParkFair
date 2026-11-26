const express = require("express");
const cors = require("cors");
const { authenticate, requireRole } = require("./middleware/authMiddleware");
const { ApiError, handleError } = require("./middleware/apiErrors");

const app = express();
app.disable("x-powered-by");
const origins = (process.env.WEB_ORIGINS ?? "").split(",").map((entry) => entry.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    callback(null, Boolean(origin && origins.includes(origin)));
  },
}));
app.use(express.json({ limit: "128kb" }));
app.use(express.urlencoded({ extended: false, limit: "128kb" }));

app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/health", require("./routes/healthRoutes"));
app.use("/api/resident", authenticate, requireRole("RESIDENT"), require("./routes/residentRoutes"));

const adminRoutes = {
  flats: [require("./routes/flatRoutes")],
  vehicles: [require("./routes/vehicleRoutes")],
  layouts: [require("./routes/layoutRoutes")],
  cycles: [
    require("./routes/parkingCycleRoutes"),
    require("./routes/cycleMatrixRoutes"),
    require("./routes/cycleSummaryRoutes"),
    require("./routes/cloneCycleRoutes"),
  ],
  assignments: [require("./routes/parkingAssignmentRoutes")],
  slots: [require("./routes/parkingSlotRoutes")],
  allocations: [require("./routes/allocationRoutes")],
  dashboard: [require("./routes/dashboardRoutes")],
  notifications: [require("./routes/notificationRoutes")],
};
for (const [path, routers] of Object.entries(adminRoutes)) {
  app.use(`/api/${path}`, authenticate, requireRole("ADMIN"), ...routers);
}

app.get("/", (req, res) => res.json({ project: "ParkFair", version: "1.0.0", status: "Running" }));
app.use((req, res, next) => next(new ApiError(404, "Route not found.")));
app.use(handleError);
module.exports = app;
