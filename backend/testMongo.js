const mongoose = require("mongoose");

mongoose
  .connect("YOUR_MONGODB_URI_HERE")
  .then(() => {
    console.log("CONNECTED");
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });