require("dotenv").config();
console.log(process.env.MONGODB_URI);
const app = require("./app");
const connectDB = require("./config/db");

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 ParkFair Server running on port ${PORT} (${process.env.NODE_ENV || "development"})`
  );
});