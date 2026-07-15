const asyncHandler = require("express-async-handler");
const Order   = require("../models/Order");
const Product = require("../models/Product");
const User    = require("../models/User");

// @route GET /api/admin/analytics
const getAnalytics = asyncHandler(async (req, res) => {
  const now      = new Date();
  const y        = now.getFullYear();
  const mStart   = new Date(y, now.getMonth(), 1);
  const lmStart  = new Date(y, now.getMonth() - 1, 1);
  const lmEnd    = new Date(y, now.getMonth(), 0, 23, 59, 59);

  const [
    monthlySales,
    topProducts,
    categoryRevenue,
    revenueThisMonth,
    revenueLastMonth,
    ordersThisMonth,
    ordersLastMonth,
    newUsersThisMonth,
    newUsersLastMonth,
  ] = await Promise.all([
    // Monthly revenue last 12 months
    Order.aggregate([
      { $match: { status: { $ne: "Cancelled" }, createdAt: { $gte: new Date(y - 1, now.getMonth(), 1) } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),

    // Top 10 products by sold count
    Product.find().sort({ numSold: -1 }).limit(10).select("name brand images price discountPrice numSold stock"),

    // Revenue by category
    Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $unwind: "$items" },
      { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "prod" } },
      { $unwind: { path: "$prod", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "categories", localField: "prod.category", foreignField: "_id", as: "cat" } },
      { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
      { $group: { _id: "$cat.name", revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }, count: { $sum: "$items.quantity" } } },
      { $sort: { revenue: -1 } },
      { $limit: 8 },
    ]),

    // This month revenue
    Order.aggregate([
      { $match: { status: { $ne: "Cancelled" }, createdAt: { $gte: mStart } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),

    // Last month revenue
    Order.aggregate([
      { $match: { status: { $ne: "Cancelled" }, createdAt: { $gte: lmStart, $lte: lmEnd } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),

    Order.countDocuments({ createdAt: { $gte: mStart } }),
    Order.countDocuments({ createdAt: { $gte: lmStart, $lte: lmEnd } }),
    User.countDocuments({ role: "customer", createdAt: { $gte: mStart } }),
    User.countDocuments({ role: "customer", createdAt: { $gte: lmStart, $lte: lmEnd } }),
  ]);

  const pct = (curr, prev) => {
    if (!prev) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const rtm  = revenueThisMonth[0]?.total  || 0;
  const rlm  = revenueLastMonth[0]?.total  || 0;

  res.json({
    success: true,
    data: {
      monthlySales,
      topProducts,
      categoryRevenue,
      comparison: {
        revenueThisMonth:   rtm,
        revenueLastMonth:   rlm,
        revenuePct:         pct(rtm, rlm),
        ordersThisMonth,
        ordersLastMonth,
        ordersPct:          pct(ordersThisMonth, ordersLastMonth),
        newUsersThisMonth,
        newUsersLastMonth,
        usersPct:           pct(newUsersThisMonth, newUsersLastMonth),
      },
    },
  });
});

module.exports = { getAnalytics };
