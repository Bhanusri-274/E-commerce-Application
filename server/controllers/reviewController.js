const asyncHandler = require("express-async-handler");
const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");

const recalculateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await Product.findByIdAndUpdate(productId, {
    ratingsAverage: stats[0]?.avg || 0,
    ratingsCount: stats[0]?.count || 0,
  });
};

// @route GET /api/products/:productId/reviews
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });
  res.json({ success: true, data: reviews });
});

// @route POST /api/products/:productId/reviews
const createReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const productId = req.params.productId;

  const alreadyReviewed = await Review.findOne({ product: productId, user: req.user._id });
  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }

  const isVerifiedPurchase = !!(await Order.findOne({
    user: req.user._id,
    "items.product": productId,
    status: "Delivered",
  }));

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    rating,
    title,
    comment,
    isVerifiedPurchase,
  });

  await recalculateProductRating(productId);
  res.status(201).json({ success: true, data: review });
});

// @route DELETE /api/admin/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }
  const productId = review.product;
  await review.deleteOne();
  await recalculateProductRating(productId);
  res.json({ success: true, message: "Review removed" });
});

// @route GET /api/admin/reviews
const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate("user", "name email")
    .populate("product", "name slug")
    .sort({ createdAt: -1 });
  res.json({ success: true, data: reviews });
});

module.exports = { getProductReviews, createReview, deleteReview, getAllReviews };
