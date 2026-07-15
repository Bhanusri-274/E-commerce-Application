const asyncHandler = require("express-async-handler");
const Wishlist = require("../models/Wishlist");

const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  res.json({ success: true, data: wishlist });
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });

  if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }
  await wishlist.populate("products");
  res.status(201).json({ success: true, data: wishlist });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    res.status(404);
    throw new Error("Wishlist not found");
  }
  wishlist.products = wishlist.products.filter((p) => p.toString() !== req.params.productId);
  await wishlist.save();
  await wishlist.populate("products");
  res.json({ success: true, data: wishlist });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
