const Flat = require("../models/Flat");
const ParkingAssignment = require(
  "../models/ParkingAssignment"
);
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

const getFlatHistory = async (
  req,
  res
) => {
  try {
    const flat =
      await Flat.findById(
        req.params.flatId
      );

    if (!flat) {
      return res.status(404).json({
        success: false,
        message: "Flat not found",
      });
    }

    const history =
      await ParkingAssignment.find({
        flatId: flat._id,
      })
        .populate(
          "cycleId",
          "cycleName"
        )
        .populate(
          "slotId",
          "slotNumber"
        )
        .sort({
          createdAt: 1,
        });

    const formattedHistory =
      history.map((item) => ({
        cycle:
          item.cycleId?.cycleName ||
          "Unknown",
        slot:
          item.slotId?.slotNumber ||
          "Unknown",
        parkingType:
          item.parkingType,
        status:
          item.assignmentStatus,
      }));

    res.status(200).json({
      success: true,
      flatNumber:
        flat.flatNumber,
      history:
        formattedHistory,
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
  getFlatHistory,
};