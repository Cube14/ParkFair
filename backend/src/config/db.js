const mongoose = require("mongoose");

module.exports = () => mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  // Index rollouts against existing data are an explicit deployment step.
  autoIndex: process.env.NODE_ENV !== "production",
  autoCreate: process.env.NODE_ENV !== "production",
});
