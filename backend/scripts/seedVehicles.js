const connectDB = require("./db");

const Flat = require("../src/models/Flat");
const Vehicle = require("../src/models/Vehicle");

const seedVehicles = async () => {
  try {
    await connectDB();

    console.log("🧹 Clearing vehicles...");

    await Vehicle.deleteMany();

    const flats = await Flat.find();

    const vehicleDocs = flats.map((flat, index) => ({
      vehicleNumber: `TEST${1000 + index}`,
      vehicleType: "CAR",
      flatId: flat._id,
      isPrimaryVehicle: true,
    }));

    await Vehicle.insertMany(vehicleDocs);

    console.log(
      `✅ Created ${vehicleDocs.length} vehicles`
    );

    process.exit();
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
};

seedVehicles();