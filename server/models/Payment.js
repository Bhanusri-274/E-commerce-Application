const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order:              { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    user:               { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true },
    razorpayOrderId:    { type: String, default: "" },
    razorpayPaymentId:  { type: String, default: "" },
    razorpaySignature:  { type: String, default: "" },
    amount:             { type: Number, required: true },
    currency:           { type: String, default: "INR" },
    method:             { type: String, enum: ["COD", "RAZORPAY"], default: "COD" },
    status:             { type: String, enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"], default: "PENDING" },
    paidAt:             { type: Date },
    refundedAt:         { type: Date },
    refundAmount:       { type: Number, default: 0 },
    notes:              { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
