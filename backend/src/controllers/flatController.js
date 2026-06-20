const Flat = require("../models/Flat");

/*
|--------------------------------------------------------------------------
| Get All Flats
|--------------------------------------------------------------------------
*/

const getAllFlats = async (req, res) => {
  try {
    const flats = await Flat.find();

    res.status(200).json(flats);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| Create Flat
|--------------------------------------------------------------------------
*/

const createFlat = async (req, res) => {
  try {
    const { flatNumber, ownerName } = req.body;
    const existingFlat = await Flat.findOne({
         flatNumber,
    });

    if (existingFlat) {
        return res.status(400).json({
            success: false,
            message: "Flat already exists",
        });
    }
    const flat = await Flat.create({
      flatNumber,
      ownerName,
    });

    res.status(201).json({
      success: true,
      data: flat,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  getAllFlats,
  createFlat,
};