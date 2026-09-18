const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const name = req.body.name.trim();
const email = req.body.email.trim().toLowerCase();
const password = req.body.password;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Lock the password safely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (voucherUsed starts as false automatically)
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Create login ticket (JWT token)
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      message: 'Account created successfully! You have a ₹500 welcome voucher on your first order.',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        voucherUsed: newUser.voucherUsed,
        orderCount: newUser.orderCount || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(200).json({
      message: 'Login successful',
      token,   
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        voucherUsed: user.voucherUsed,
        orderCount: user.orderCount || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});
// FORGOT PASSWORD - send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();

    console.log("Forgot password email received:", email);

    const user = await User.findOne({ email });

    console.log("User found:", user);

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

    const resetLink = `https://digihub-gules.vercel.app/reset-password/${resetToken}`;

    console.log("About to send email...");

    await transporter.sendMail({
      from: `"DigiHub" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Reset your DigiHub password',
      html: `
        <p>Hi ${user.name},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    console.log("Email sent successfully");

    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: 'Error sending reset email', error: error.message });
  }
});

// RESET PASSWORD - verify token and set new password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

module.exports = router;