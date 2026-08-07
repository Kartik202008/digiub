const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// CREATE ORDER
router.post('/', async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({
      message: 'Error creating order',
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