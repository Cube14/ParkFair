const connectDB = require("./db");

const Flat = require("../src/models/Flat");

const seedFlats = async () => {
  try {
    await connectDB();

    console.log("🧹 Clearing existing flats...");

    await Flat.deleteMany();

    const flats = [
      "101",
      "102",
      "103",
      "104",
      "201",  
      "202",
      "203",
      "204",

      "301",
      "302",
      "303",
      "304",

      "401",
      "402",
      "403",
      "404",
    ];

    const flatDocuments = flats.map((flatNumber) => ({
      flatNumber,
      wing: "A",
      floor: Number(flatNumber[0]),
    }));

    await Flat.insertMany(flatDocuments);

    console.log(
      `✅ Successfully inserted ${flatDocuments.length} flats`
    );

    process.exit();
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
};

seedFlats();