const express = require('express');
const Razorpay = require('razorpay');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

console.log('RAZORPAY ERROR:', error);
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees

    const options = {
      amount: amount * 100, // Razorpay needs paise (multiply by 100)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.log('RAZORPAY ERROR:', error);
    res.status(500).json({ message: 'Error creating payment order', error: error.message });
  }
});

module.exports = router;