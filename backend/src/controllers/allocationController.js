const {
  generateFirstRotation,
} = require("../services/allocationService");

const generateRotation = async (req, res) => {
  try {
    const result =
      await generateFirstRotation();

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  generateRotation,
};