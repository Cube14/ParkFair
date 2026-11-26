const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Flat = require("../models/Flat");
const User = require("../models/User");

/*
|--------------------------------------------------------------------------
| Login
|--------------------------------------------------------------------------
*/

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    console.log("\n========== LOGIN ==========");
    console.log("Identifier:", identifier);

    let user = await User.findOne({
      username: identifier,
    }).populate("flatId");

    // Login using Flat Number
    if (!user) {
      const flat = await Flat.findOne({
        flatNumber: identifier,
      });

      if (flat) {
        user = await User.findOne({
          flatId: flat._id,
        }).populate("flatId");
      }
    }

    if (!user) {
      console.log("❌ User not found");

      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    console.log("User:", user.username);

    // Disabled account
    if (user.isActive === false) {
      console.log("❌ User disabled");

      return res.status(403).json({
        success: false,
        message:
          "Your account has been disabled.",
      });
    }

    console.log("Stored Hash:");
    console.log(user.password);

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    console.log(
      "Password Match:",
      passwordMatch
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid username or password.",
      });
    }

    console.log("✅ Login Success");

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

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        flat: user.flatId,
      },
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/

exports.me = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.id
    )
      .populate("flatId")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Create Resident
|--------------------------------------------------------------------------
*/

exports.createResidentAccount =
  async (req, res) => {
    try {
      const {
        flatId,
        password,
      } = req.body;

      const flat =
        await Flat.findById(flatId);

      if (!flat) {
        return res.status(404).json({
          success: false,
          message: "Flat not found",
        });
      }

      const exists =
        await User.findOne({
          flatId,
        });

      if (exists) {
        return res.status(400).json({
          success: false,
          message:
            "Resident account already exists.",
        });
      }

      const hash =
        await bcrypt.hash(
          password,
          10
        );

      const user =
        await User.create({
          username:
            flat.flatNumber,
          password: hash,
          role: "RESIDENT",
          flatId,
        });

      return res.status(201).json({
        success: true,
        user,
      });

    } catch (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
      });
    }
  };

/*
|--------------------------------------------------------------------------
| Reset Password
|--------------------------------------------------------------------------
*/

exports.resetResidentPassword =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          success: false,
        });
      }

      user.password =
        await bcrypt.hash(
          req.body.password,
          10
        );

      await user.save();

      return res.json({
        success: true,
      });

    } catch (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
      });
    }
  };

/*
|--------------------------------------------------------------------------
| Toggle Resident
|--------------------------------------------------------------------------
*/

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
        });
      }

      user.isActive =
        !user.isActive;

      await user.save();

      return res.json({
        success: true,
        isActive:
          user.isActive,
      });

    } catch (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
      });
    }
  };