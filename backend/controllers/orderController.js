const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');

// @desc    Place an order from the current cart
// @route   POST /api/orders
// @access  Private
const placeOrder = asyncHandler(async (req, res) => {
  const { deliveryAddress, paymentMethod, items } = req.body;

  if (!deliveryAddress) {
    res.status(400);
    throw new Error('Delivery address is required');
  }

  let orderItems = [];
  let totalPrice = 0;

  if (req.user) {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0) {
      res.status(400);
      throw new Error('Your cart is empty');
    }
    orderItems = cart.items;
  } else {
    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('Your cart is empty');
    }
    orderItems = items;
  }

  totalPrice = orderItems.reduce((sum, item) => {
    const extra = item.customization?.extraShot ? 150 : 0;
    return sum + (item.unitPrice + extra) * item.quantity;
  }, 0);

  const loyaltyPointsEarned = req.user ? Math.floor(totalPrice / 10) : 0;

  const order = await Order.create({
    userId: req.user ? req.user._id : undefined,
    items: orderItems,
    totalPrice,
    deliveryAddress,
    paymentMethod,
    loyaltyPointsEarned,
  });

  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { loyaltyPoints: loyaltyPointsEarned },
    });
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
  }

  res.status(201).json(order);
});

// @desc    Get logged-in user's order history
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get single order by id (owner or admin only)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  if (order.userId) {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized to view this order');
    }
    const isOwner = order.userId.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }
  }
  res.json(order);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('userId', 'name email').sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Update order status (Pending -> Preparing -> Out for Delivery -> Delivered)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid order status');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  const updated = await order.save();
  res.json(updated);
});

// @desc    Get public active order queue (Pending, Preparing, Out for Delivery)
// @route   GET /api/orders/public-queue
// @access  Public
const getPublicQueue = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    status: { $in: ['Pending', 'Preparing', 'Out for Delivery'] },
  })
    .select('items totalPrice status createdAt deliveryAddress.fullName')
    .sort({ createdAt: 1 }); // FIFO queue (oldest first)
  
  // Format orders to obscure sensitive customer names (e.g. "John Doe" -> "John D.")
  const formattedOrders = orders.map(order => {
    const fullName = order.deliveryAddress?.fullName || 'Guest';
    const names = fullName.trim().split(/\s+/);
    const firstName = names[0] || 'Guest';
    const lastNameInitial = names.length > 1 ? ` ${names[names.length - 1][0]}.` : '';
    
    return {
      _id: order._id,
      customerName: `${firstName}${lastNameInitial}`,
      items: order.items.map(item => ({
        name: item.name,
        size: item.size,
        quantity: item.quantity,
      })),
      totalPrice: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt,
    };
  });
  
  res.json(formattedOrders);
});

module.exports = { placeOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, getPublicQueue };

