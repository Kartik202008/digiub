const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
voucherUsed: {
  type: Boolean,
  default: false,
},
orderCount: {
  type: Number,
  default: 0,
},
  addresses: [
    {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);