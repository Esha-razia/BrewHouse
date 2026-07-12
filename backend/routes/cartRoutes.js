const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getCart).post(protect, addToCart).delete(protect, clearCart);

router.route('/:itemId').put(protect, updateCartItem).delete(protect, removeCartItem);

module.exports = router;
