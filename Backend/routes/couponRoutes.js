const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// Apply coupon
router.post("/apply", protect, async (req, res) => {
  try {
    const { code } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (code !== "DIGI500") {
      return res.status(400).json({ message: "Invalid coupon code" });
    }

    if (user.voucherUsed || user.orderCount > 0) {
      return res.status(400).json({
        message: "Coupon already used or not eligible",
      });
    }

    res.json({
      success: true,
      discount: 500,
      message: "Coupon applied successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;