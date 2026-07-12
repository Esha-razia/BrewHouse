const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true }, // snapshot so cart survives product edits
    image: { type: String, required: true },
    size: {
      type: String,
      enum: ['small', 'medium', 'large'],
      required: true,
    },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    customization: {
      milk: { type: String, default: 'Whole Milk' },
      sugarLevel: { type: String, default: 'Normal' },
      extraShot: { type: Boolean, default: false },
      temperature: { type: String, default: 'Hot' },
    },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one active cart per user
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Virtual for total price, so frontend doesn't have to recompute it
cartSchema.virtual('totalPrice').get(function () {
  return this.items.reduce((sum, item) => {
    const extra = item.customization?.extraShot ? 0.75 : 0;
    return sum + (item.unitPrice + extra) * item.quantity;
  }, 0);
});

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);
