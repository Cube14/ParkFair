const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    status: "ParkFair API Running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealth,
};