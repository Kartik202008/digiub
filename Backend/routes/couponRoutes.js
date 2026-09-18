const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");

// Check eligibility for welcome coupon DIGI500
router.get("/eligibility", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.voucherUsed) {
      return res.json({
        eligible: false,
        reason: "Coupon already used",
      });
    }

    // Check if user has already placed an order
    const orderExists = await Order.exists({ user: user._id });
    if (orderExists || (user.orderCount && user.orderCount > 0)) {
      return res.json({
        eligible: false,
        reason: "Welcome offer is only valid for first-time orders",
      });
    }

    return res.json({
      eligible: true,
      code: "DIGI500",
      discount: 500,
      message: "Congratulations! You are eligible for the ₹500 welcome coupon DIGI500.",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error checking coupon eligibility" });
  }
});

// Apply coupon (validates coupon without prematurely consuming it)
router.post("/apply", protect, async (req, res) => {
  try {
    const { code } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const normalizedCode = (code || "").trim().toUpperCase();

    if (normalizedCode !== "DIGI500" && normalizedCode !== "DIGIHUB500") {
      return res.status(400).json({ success: false, message: "Invalid coupon code" });
    }

    if (user.voucherUsed) {
      return res.status(400).json({
        success: false,
        message: "Welcome coupon has already been used",
      });
    }

    const orderExists = await Order.exists({ user: user._id });
    if (orderExists || (user.orderCount && user.orderCount > 0)) {
      return res.status(400).json({
        success: false,
        message: "Welcome coupon is only valid for first-time orders",
      });
    }

    res.json({
      success: true,
      code: "DIGI500",
      discount: 500,
      message: "Welcome coupon DIGI500 applied successfully! (₹500 discount)",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;