const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getPublicQueue,
} = require('../controllers/orderController');
const { protect, admin, optionalProtect } = require('../middleware/authMiddleware');

router.route('/').post(optionalProtect, placeOrder).get(protect, admin, getAllOrders);
router.get('/myorders', protect, getMyOrders);
router.get('/public-queue', getPublicQueue);
router.get('/:id', optionalProtect, getOrderById);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;

