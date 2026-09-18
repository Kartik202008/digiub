const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// GET user cart
router.get("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart.product");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.cart || []);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
});

// SYNC user cart (save current cart items to DB)
router.post("/sync", protect, async (req, res) => {
  try {
    const { items } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // items can be an array of { id / product, quantity }
    const formattedCart = (Array.isArray(items) ? items : [])
      .filter((item) => item && (item.product || item._id || item.id))
      .map((item) => ({
        product: item.product || item._id || item.id,
        quantity: item.quantity || 1,
      }));

    user.cart = formattedCart;
    await user.save();

    res.json({ message: "Cart synced successfully", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Error syncing cart", error: error.message });
  }
});

// CLEAR user cart
router.delete("/", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.cart = [];
    await user.save();
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart", error: error.message });
  }
});

module.exports = router;
