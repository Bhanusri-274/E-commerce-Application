const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    image: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    paymentMethod: { type: String, enum: ["COD", "RAZORPAY"], default: "COD" },
    paymentResult: {
      id: String,
      status: String,
      razorpayOrderId: String,
      razorpaySignature: String,
    },
    itemsPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, required: true, default: 0 },
    couponCode: { type: String, default: null },
    totalPrice: { type: Number, required: true, default: 0 },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    deliveredAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre("save", function (next) {
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = `SHZ${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 900 + 100)}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
