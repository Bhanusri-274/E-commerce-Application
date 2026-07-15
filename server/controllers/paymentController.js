const asyncHandler = require("express-async-handler");
const Order   = require("../models/Order");
const Payment = require("../models/Payment");

// @desc  Mark COD order as confirmed and create a payment record
// @route POST /api/payments/cod/:orderId
const confirmCOD = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) { res.status(404); throw new Error("Order not found"); }
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403); throw new Error("Not authorised");
  }

  let payment = await Payment.findOne({ order: order._id });
  if (!payment) {
    payment = await Payment.create({
      order:  order._id,
      user:   order.user,
      amount: order.totalPrice,
      method: "COD",
      status: "PENDING",
    });
  }

  res.json({ success: true, data: payment });
});

// @desc  Verify Razorpay payment (stub — wire up actual signature check in production)
// @route POST /api/payments/razorpay/verify
const verifyRazorpay = asyncHandler(async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const order = await Order.findById(orderId);
  if (!order) { res.status(404); throw new Error("Order not found"); }

  // TODO: verify HMAC signature with Razorpay secret before marking as paid
  order.isPaid  = true;
  order.paidAt  = new Date();
  order.paymentResult = { id: razorpayPaymentId, status: "SUCCESS", razorpayOrderId, razorpaySignature };
  order.status  = "Confirmed";
  order.statusHistory.push({ status: "Confirmed", note: "Payment verified via Razorpay" });
  await order.save();

  const payment = await Payment.create({
    order: order._id, user: order.user,
    razorpayOrderId, razorpayPaymentId, razorpaySignature,
    amount: order.totalPrice,
    method: "RAZORPAY", status: "SUCCESS", paidAt: new Date(),
  });

  res.json({ success: true, data: payment });
});

// @desc  Get payment record for an order
// @route GET /api/payments/:orderId
const getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ order: req.params.orderId }).populate("order");
  if (!payment) { res.status(404); throw new Error("Payment record not found"); }
  res.json({ success: true, data: payment });
});

module.exports = { confirmCOD, verifyRazorpay, getPayment };
