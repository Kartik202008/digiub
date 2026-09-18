const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');

// CREATE ORDER
router.post('/', async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    const allowedPaymentMethods = ['UPI', 'Card', 'NetBanking', 'Wallet', 'COD'];
    if (paymentMethod && !allowedPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        message: 'Invalid payment method selected.',
      });
    }

    if (!shippingAddress || typeof shippingAddress !== 'object') {
      return res.status(400).json({
        message: 'Shipping address is required',
      });
    }

    const { fullName, phone, street, city, state, pincode } = shippingAddress;
    const errors = {};

    const trimmedName = (fullName || '').trim();
    if (!trimmedName || trimmedName.length < 2) {
      errors.fullName = 'Enter your full name.';
    }

    const trimmedPhone = phone ? String(phone).trim() : '';
    if (!trimmedPhone || !/^[6-9]\d{9}$/.test(trimmedPhone)) {
      errors.phone = 'Enter a valid 10-digit phone number.';
    }

    const trimmedStreet = (street || '').trim();
    if (!trimmedStreet || trimmedStreet.length < 3) {
      errors.street = 'Enter your street address.';
    }

    const trimmedCity = (city || '').trim();
    if (!trimmedCity || trimmedCity.length < 2) {
      errors.city = 'Enter your city.';
    }

    const trimmedState = (state || '').trim();
    if (!trimmedState || trimmedState.length < 2) {
      errors.state = 'Enter your state.';
    }

    const trimmedPin = pincode ? String(pincode).trim() : '';
    if (!trimmedPin || !/^[1-9]\d{5}$/.test(trimmedPin)) {
      errors.pincode = 'Enter a valid 6-digit PIN code.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: Object.values(errors)[0],
        errors,
      });
    }

    const order = await Order.create(req.body);

    // If user is attached, update orderCount, voucherUsed and clean up DB cart
    if (order.user) {
      const userUpdates = {
        $inc: { orderCount: 1 },
      };

      if (order.voucherApplied) {
        userUpdates.voucherUsed = true;
      }

      if (order.orderItems && order.orderItems.length > 0) {
        const purchasedProductIds = order.orderItems
          .map((item) => item.product)
          .filter(Boolean);

        userUpdates.$pull = {
          cart: { product: { $in: purchasedProductIds } },
        };
      }

      await User.findByIdAndUpdate(order.user, userUpdates);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({
      message: 'Error creating order',
      error: error.message,
    });
  }
});

// GET MY ORDERS (Logged-in user)
router.get('/my-orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching user orders',
      error: error.message,
    });
  }
});

// GET ALL ORDERS (Admin)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching orders',
      error: error.message,
    });
  }
});

// UPDATE ORDER STATUS
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = status;
    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating order status',
      error: error.message,
    });
  }
});

module.exports = router;