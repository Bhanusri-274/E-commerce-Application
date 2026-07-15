const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// @route GET /api/admin/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalProducts, totalOrders, revenueAgg, recentOrders, monthlySales] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),
    Order.find().populate("user", "name").sort({ createdAt: -1 }).limit(8),
    Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]),
  ]);

  const orderStatusBreakdown = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalProducts,
      totalOrders,
      revenue: revenueAgg[0]?.total || 0,
      recentOrders,
      monthlySales,
      orderStatusBreakdown,
    },
  });
});

module.exports = { getDashboardStats };
