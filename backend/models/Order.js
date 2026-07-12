const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    size: { type: String, enum: ['small', 'medium', 'large'], required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    customization: {
      milk: String,
      sugarLevel: String,
      extraShot: Boolean,
      temperature: String,
    },
  },
  { _id: false }
);

const deliveryAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
      type: deliveryAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash on Delivery', 'Card', 'UPI'],
      default: 'Cash on Delivery',
    },
    status: {
      type: String,
      enum: ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    loyaltyPointsEarned: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // createdAt covers the "createdAt" field requested in the brief
);

module.exports = mongoose.model('Order', orderSchema);
