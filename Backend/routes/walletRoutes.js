const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// GET WALLET DETAILS
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      balance: user.walletBalance,
      transactions: user.walletTransactions,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching wallet',
      error: error.message,
    });
  }
});

// CREATE RAZORPAY ORDER FOR WALLET TOP-UP
router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `wallet_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: 'Error creating wallet payment order',
      error: error.message,
    });
  }
});

// ADD MONEY TO WALLET (after successful payment)
router.post('/add-money', async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.walletBalance += amount;

    user.walletTransactions.unshift({
      type: 'credit',
      amount,
      description: 'Money added to wallet',
    });

    await user.save();

    res.json({
      message: 'Money added successfully',
      balance: user.walletBalance,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error adding money',
      error: error.message,
    });
  }
});

// REFUND TO WALLET
router.post('/refund', async (req, res) => {
  try {
    const { userId, amount, orderId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.walletBalance += amount;

    user.walletTransactions.unshift({
      type: 'credit',
      amount,
      description: `Refund for Order #${orderId.slice(-6)}`,
    });

    await user.save();

    res.json({
      message: 'Refund added to wallet successfully',
      balance: user.walletBalance,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error processing refund',
      error: error.message,
    });
  }
});

module.exports = router;