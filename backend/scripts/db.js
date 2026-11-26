const mongoose = require("mongoose");

// These seed scripts replace collections. Use a dedicated local fixture database.
module.exports = async function connectSeedDatabase() {
  const uri = process.env.PARKFAIR_SEED_URI ?? "";
  if (!/^mongodb:\/\/127\.0\.0\.1:\d{1,5}\/parkfair_seed_[a-z0-9_]+(?:\?directConnection=true)?$/.test(uri)) {
    throw new Error("Set PARKFAIR_SEED_URI to a dedicated loopback parkfair_seed_* database.");
  }
  return mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
};
