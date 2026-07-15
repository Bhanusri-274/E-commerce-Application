const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");

const SHIPPING_FLAT_RATE = 49;
const FREE_SHIPPING_THRESHOLD = 999;

// @desc Place an order from the current cart
// @route POST /api/orders
const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Your cart is empty");
  }

  // Validate stock for every item
  for (const item of cart.items) {
    if (!item.product || item.product.stock < item.quantity) {
      res.status(400);
      throw new Error(`${item.product?.name || "A product"} is out of stock`);
    }
  }

  const itemsPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = cart.coupon?.discountAmount || 0;
  const shippingPrice = itemsPrice - discountAmount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const totalPrice = Math.max(itemsPrice - discountAmount + shippingPrice, 0);

  const order = await Order.create({
    user: req.user._id,
    items: cart.items.map((i) => ({
      product: i.product._id,
      name: i.product.name,
      image: i.product.images?.[0]?.url || "",
      price: i.price,
      quantity: i.quantity,
    })),
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    discountAmount,
    couponCode: cart.coupon?.code || null,
    totalPrice,
    status: "Pending",
    statusHistory: [{ status: "Pending", note: "Order placed" }],
  });

  // Decrement stock, increment sold count
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity, numSold: item.quantity },
    });
  }

  if (cart.coupon?.code) {
    await Coupon.findOneAndUpdate({ code: cart.coupon.code }, { $inc: { usedCount: 1 } });
  }

  // Clear cart
  cart.items = [];
  cart.coupon = { code: null, discountAmount: 0 };
  await cart.save();

  res.status(201).json({ success: true, data: order });
});

// @desc Get logged-in user's orders
// @route GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
});

// @desc Get single order (owner or admin)
// @route GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }
  res.json({ success: true, data: order });
});

// @desc Cancel an order (customer, only if not shipped)
// @route PUT /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to cancel this order");
  }
  if (["Shipped", "Delivered", "Cancelled"].includes(order.status)) {
    res.status(400);
    throw new Error(`Order cannot be cancelled once it is ${order.status.toLowerCase()}`);
  }

  order.status = "Cancelled";
  order.cancelledAt = new Date();
  order.statusHistory.push({ status: "Cancelled", note: "Cancelled by customer" });
  await order.save();

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, numSold: -item.quantity } });
  }

  res.json({ success: true, data: order });
});

// ---------------- ADMIN ----------------

// @desc Get all orders (admin) with search + status filter
// @route GET /api/admin/orders
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) query.orderNumber = { $regex: search, $options: "i" };

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) },
  });
});

// @desc Update order status (admin)
// @route PUT /api/admin/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.status = status;
  order.statusHistory.push({ status, note });
  if (status === "Delivered") order.deliveredAt = new Date();

  await order.save();
  res.json({ success: true, data: order });
});

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};
