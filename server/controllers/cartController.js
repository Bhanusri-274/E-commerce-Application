const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

// @route GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.json({ success: true, data: cart });
});

// @route POST /api/cart
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (product.stock < quantity) {
    res.status(400);
    throw new Error("Insufficient stock available");
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const existingItem = cart.items.find((i) => i.product.toString() === productId);
  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    cart.items.push({ product: productId, quantity, price: effectivePrice });
  }

  await cart.save();
  await cart.populate("items.product");
  res.status(201).json({ success: true, data: cart });
});

// @route PUT /api/cart/:itemId
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }
  const item = cart.items.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error("Cart item not found");
  }
  item.quantity = quantity;
  await cart.save();
  await cart.populate("items.product");
  res.json({ success: true, data: cart });
});

// @route DELETE /api/cart/:itemId
const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }
  cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
  await cart.save();
  await cart.populate("items.product");
  res.json({ success: true, data: cart });
});

// @route POST /api/cart/apply-coupon
const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Your cart is empty");
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon || coupon.expiresAt < new Date()) {
    res.status(400);
    throw new Error("Coupon is invalid or has expired");
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    res.status(400);
    throw new Error("Coupon usage limit reached");
  }

  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  if (subtotal < coupon.minOrderValue) {
    res.status(400);
    throw new Error(`Minimum order value for this coupon is ₹${coupon.minOrderValue}`);
  }

  let discount =
    coupon.discountType === "PERCENTAGE" ? (subtotal * coupon.discountValue) / 100 : coupon.discountValue;
  if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);

  cart.coupon = { code: coupon.code, discountAmount: Math.round(discount) };
  await cart.save();

  res.json({ success: true, data: cart });
});

// @route DELETE /api/cart/coupon
const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  cart.coupon = { code: null, discountAmount: 0 };
  await cart.save();
  res.json({ success: true, data: cart });
});

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, applyCoupon, removeCoupon };
