const { connection } = require("mongoose");
const { ApiError } = require("./apiErrors");

module.exports = (req, res, next) => {
  if (process.env.NODE_ENV !== "development" || process.env.ENABLE_DEV_RESETS !== "true" ||
      connection.host !== "127.0.0.1" || !/^parkfair_(?:dev$|seed_[a-z0-9_]+$|test_[a-z0-9_]+$)/.test(connection.name ?? "")) {
    throw new ApiError(403, "Reset operations are disabled.");
  }
  next();
};
