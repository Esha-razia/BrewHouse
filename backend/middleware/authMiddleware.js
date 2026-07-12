const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * Verifies the JWT from the Authorization header ("Bearer <token>"),
 * loads the matching user (without password), and attaches it to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.status(401);
        throw new Error('User no longer exists');
      }
      return next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token invalid or expired');
    }
  }

  res.status(401);
  throw new Error('Not authorized, no token provided');
});

/**
 * Must run after `protect`. Blocks any user whose role isn't 'admin'.
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin' && req.user.email === 'admin@brewhouse.com') {
    return next();
  }
  res.status(403);
  throw new Error('Not authorized as an admin. Access restricted.');
};

/**
 * Optional protection middleware. If authorization token is present, verifies it.
 * If token is missing, expired, or invalid, fails silently to allow guest access.
 */
const optionalProtect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Fail silently to support guest requests
    }
  }
  next();
});

module.exports = { protect, admin, optionalProtect };
