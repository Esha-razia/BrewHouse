const mongoose = require('mongoose');

// Price differs by size, so we store it as a small map instead of one flat number
const priceBySizeSchema = new mongoose.Schema(
  {
    small: { type: Number, required: true },
    medium: { type: Number, required: true },
    large: { type: Number, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Premium Blend Iced Capp',
        'Brew Signature Blended',
        'HOT & COLD BEVERAGES',
        'Matcha',
        'Tea',
        'Coffee Beans',
      ],
    },
    // Only relevant when category is 'Espresso-based', but kept flexible for future use
    subType: {
      type: String,
      enum: ['Americano', 'Latte', 'Cappuccino', 'Mocha', 'Macchiato', null],
      default: null,
    },
    priceBySize: {
      type: priceBySizeSchema,
      required: true,
    },
    image: {
      type: String, // URL to product image
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    calories: {
      // calories per size, keeps the same shape as price for simplicity
      small: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      large: { type: Number, default: 0 },
    },
    customization: {
      milkOptions: {
        type: [String],
        default: ['Whole Milk', 'Skimmed Milk', 'Oat Milk', 'Almond Milk', 'Soy Milk'],
      },
      sugarLevels: {
        type: [String],
        default: ['No Sugar', 'Less Sugar', 'Normal', 'Extra Sweet'],
      },
      allowExtraShot: { type: Boolean, default: true },
    },
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      keywords: { type: String, default: '' },
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
  },
  { timestamps: true }
);

// Enables fast text search by name/category for the search bar feature
productSchema.index({ name: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
