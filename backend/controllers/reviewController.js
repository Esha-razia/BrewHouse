const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');

const AVATAR_COLORS = [
  'bg-accent-500', 'bg-coffee-600', 'bg-emerald-600',
  'bg-violet-600', 'bg-pink-600', 'bg-sky-600', 'bg-amber-600',
];

// @desc    Get all reviews (newest first)
// @route   GET /api/reviews
// @access  Public
const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({}).sort({ createdAt: -1 }).limit(20);
  res.json(reviews);
});

// @desc    Submit a new review
// @route   POST /api/reviews
// @access  Public
const createReview = asyncHandler(async (req, res) => {
  const { name, rating, text } = req.body;

  if (!name || !rating || !text) {
    res.status(400);
    throw new Error('Name, rating, and review text are all required.');
  }

  if (rating < 1 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5.');
  }

  if (text.length < 10) {
    res.status(400);
    throw new Error('Review must be at least 10 characters long.');
  }

  const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  const review = await Review.create({
    name: name.trim(),
    rating: Number(rating),
    text: text.trim(),
    avatarColor: randomColor,
  });

  res.status(201).json(review);
});

module.exports = { getReviews, createReview };
