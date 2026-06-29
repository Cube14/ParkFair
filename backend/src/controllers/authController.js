const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const Flat = require("../models/Flat");
const User = require("../models/User");
exports.login = async (req, res) => {
  try {
    const {
      identifier,
      password,
    } = req.body;

    let user =
      await User.findOne({
        username: identifier,
      }).populate("flatId");

    if (!user) {
      const flat =
        await Flat.findOne({
          flatNumber: identifier,
        });

      if (flat) {
        user =
          await User.findOne({
            flatId: flat._id,
          }).populate("flatId");
      }
    }

    if (!user) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been disabled. Please contact the administrator.",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid username/flat number or password.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,

      token,

      user: {
        id: user._id,

        username: user.username,

        role: user.role,

        flat: user.flatId,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

exports.me = async (req, res) => {
  try {
    const user =
      await User.findById(req.user.id)
        .populate("flatId")
        .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
exports.createResidentAccount = async (req, res) => {
  try {
    const {
      flatId,
      password,
    } = req.body;

    const flat = await Flat.findById(flatId);

    if (!flat) {
      return res.status(404).json({
        success: false,
        message: "Flat not found",
      });
    }

    const existingUser =
      await User.findOne({
        flatId,
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "Resident account already exists.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user =
      await User.create({
        username: flat.flatNumber,
        password: hashedPassword,
        role: "RESIDENT",
        flatId,
      });

    res.status(201).json({
      success: true,
      message:
        "Resident account created.",
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
exports.resetResidentPassword =
  async (req, res) => {
    try {
      const { id } = req.params;

      const { password } = req.body;

      const user =
        await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      user.password =
        await bcrypt.hash(password, 10);

      await user.save();

      res.json({
        success: true,
        message:
          "Password updated.",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  };
  exports.toggleResidentStatus =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      user.isActive =
        !user.isActive;

      await user.save();

      res.json({
        success: true,
        isActive:
          user.isActive,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
      });
    }
  };