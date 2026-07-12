const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Finds the logged-in user's cart, creating an empty one if it doesn't exist yet
const findOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
};

// @desc    Get the logged-in user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const cart = await findOrCreateCart(req.user._id);
  res.json(cart);
});

// @desc    Add an item to the cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, size, quantity = 1, customization = {} } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (!product.inStock) {
    res.status(400);
    throw new Error('This product is currently out of stock');
  }

  const unitPrice = product.priceBySize[size];
  if (!unitPrice) {
    res.status(400);
    throw new Error('Invalid size selected');
  }

  const cart = await findOrCreateCart(req.user._id);

  // If the same product/size/customization combo is already in the cart, bump quantity
  const existing = cart.items.find(
    (item) =>
      item.product.toString() === productId &&
      item.size === size &&
      item.customization.milk === (customization.milk || 'Whole Milk') &&
      item.customization.sugarLevel === (customization.sugarLevel || 'Normal') &&
      !!item.customization.extraShot === !!customization.extraShot
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({
      product: product._id,
      name: product.name,
      image: product.image,
      size,
      unitPrice,
      quantity,
      customization,
    });
  }

  await cart.save();
  res.status(201).json(cart);
});

// @desc    Update quantity of a cart item
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error('Quantity must be at least 1');
  }

  const cart = await findOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error('Cart item not found');
  }

  item.quantity = quantity;
  await cart.save();
  res.json(cart);
});

// @desc    Remove an item from the cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await findOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error('Cart item not found');
  }

  item.deleteOne();
  await cart.save();
  res.json(cart);
});

// @desc    Clear the entire cart (used after placing an order)
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await findOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  res.json(cart);
});

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
