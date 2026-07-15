const ParkingCycle = require("../models/ParkingCycle");
const ParkingAssignment = require("../models/ParkingAssignment");
const {
  sendMessage,
} = require("../services/whatsappService");
const Flat = require("../models/Flat");
const {
  sendActiveCycleNotifications,
  previewActiveCycleNotifications,
} = require("../services/notificationService");

/*
|--------------------------------------------------------------------------
| Test Notification
|--------------------------------------------------------------------------
*/

exports.sendTest =
  async (req, res) => {
    try {
      const { phone } =
        req.body;

      await sendMessage(
        phone,
`🏠 ParkFair Test

Hello!

If you're reading this,

ParkFair WhatsApp integration is working perfectly.

🚗 Test Successful`
      );

      res.json({
        success: true,
        message:
          "Message sent successfully.",
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };

exports.sendSingleResident =
  async (req, res) => {
    try {
      const { flatNumber } = req.body;

      const activeCycle =
        await ParkingCycle.findOne({
          status: "PLANNED",
        });

      if (!activeCycle) {
        return res.status(404).json({
          success: false,
          message:
            "No active cycle found.",
        });
      }

      const flat =
        await Flat.findOne({
          flatNumber,
        });

      if (!flat) {
        return res.status(404).json({
          success: false,
          message:
            "Flat not found.",
        });
      }

      const assignment =
        await ParkingAssignment.findOne({
          cycleId: activeCycle._id,
          assignmentStatus: "ACTIVE",
          flatId: flat._id,
        })
          .populate("flatId")
          .populate("vehicleId")
          .populate("slotId");

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message:
            "Flat assignment not found.",
        });
      }

      const vehicle =
        assignment.vehicleId;

      const slot =
        assignment.slotId;

      const startDate =
        new Date(
          activeCycle.startDate
        ).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );

      const endDate =
        new Date(
          activeCycle.endDate
        ).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );

      let slotDisplay = "";

      if (
        assignment.parkingType ===
        "OUTSIDE"
      ) {
        slotDisplay =
          "Outside Parking Area";
      } else {
        slotDisplay = slot.slotNumber;
      }

      const message = `🏠 *SIDDH-A Society*

Dear *${flat.ownerName}*,

Your parking allocation for the upcoming parking cycle is as follows.

Please park your vehicle in the assigned location starting from 16 Jul 2026.

━━━━━━━━━━━━━━━━━━

🏢 *Flat*
${flat.flatNumber}

🚗 *Vehicle*
${vehicle.vehicleNumber}

📍 *Parking Type*
${assignment.parkingType}

🅿 *Assigned Slot*
${slotDisplay}

📅 *Cycle*
${activeCycle.cycleName}

📆 *Duration*
${startDate} - ${endDate}

━━━━━━━━━━━━━━━━━━

Please ensure your vehicle is parked only in the assigned location throughout this cycle.

If you notice any discrepancy, kindly contact the society administrator.

_This is an automated notification from the SIDDH-A Society Parking Management System._

Thank you.

Have a wonderful day. 😊`;

      await sendMessage(
        flat.contactNumber,
        message
      );

      res.json({
        success: true,
        message:
          "Notification sent successfully.",
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
        message:
          err.message,
      });
    }
  };


/*
|--------------------------------------------------------------------------
| Send Notifications To Active Cycle
|--------------------------------------------------------------------------
*/
exports.previewNotifications =
  async (req, res) => {
    try {
      const result =
        await previewActiveCycleNotifications();

      res.status(200).json(result);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
exports.sendActiveNotifications =
  async (req, res) => {
    try {
      const result =
        await sendActiveCycleNotifications();

      res.status(200).json(result);
    } catch (err) {
      console.error(err);

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  };
console.log({
  sendTest: typeof exports.sendTest,
  sendSingleResident: typeof exports.sendSingleResident,
  sendActiveNotifications: typeof exports.sendActiveNotifications,
  previewNotifications: typeof exports.previewNotifications,
});