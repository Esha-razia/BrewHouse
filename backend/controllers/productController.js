const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Get all products (supports ?category=&search=&badge=)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { category, search, badge } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (badge === 'bestseller') filter.isBestSeller = true;
  if (badge === 'new') filter.isNewArrival = true;

  if (search) {
    // Case-insensitive partial match on name or category (search bar feature)
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }

  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
});

// @desc    Get single product by id
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product(req.body);
  const created = await product.save();
  res.status(201).json(created);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  Object.assign(product, req.body);
  const updated = await product.save();
  res.json(updated);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  await product.deleteOne();
  res.json({ message: 'Product removed' });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
