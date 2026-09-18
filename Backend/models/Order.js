const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    
  },
  orderItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: String,
      quantity: Number,
      price: Number,
      image: String,
    },
  ],
  shippingAddress: {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit phone number.'],
    },
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
      minlength: [3, 'Street address must be at least 3 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      minlength: [2, 'City must be at least 2 characters'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      minlength: [2, 'State must be at least 2 characters'],
    },
    pincode: {
      type: String,
      required: [true, 'PIN code is required'],
      trim: true,
      match: [/^[1-9]\d{5}$/, 'Enter a valid 6-digit PIN code.'],
    },
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['UPI', 'Card', 'NetBanking', 'Wallet', 'COD'],
  },
  voucherApplied: {
    type: Boolean,
    default: false,
  },
  itemsPrice: {
    type: Number,
    required: true,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  paidAt: {
    type: Date,
  },
  orderStatus: {
    type: String,
    enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested','Returned', 'Return Declined'],
    default: 'Placed',
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);