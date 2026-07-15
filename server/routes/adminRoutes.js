const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");

const { getDashboardStats }       = require("../controllers/dashboardController");
const { getAllOrders, updateOrderStatus } = require("../controllers/orderController");
const { getUsers, toggleBlockUser, deleteUser } = require("../controllers/adminUserController");
const { getCoupons, createCoupon, updateCoupon, deleteCoupon } = require("../controllers/couponController");
const { getAllBannersAdmin, createBanner, updateBanner, deleteBanner } = require("../controllers/bannerController");
const { getAllReviews, deleteReview } = require("../controllers/reviewController");
const { getAnalytics } = require("../controllers/adminAnalyticsController");

const router = express.Router();
router.use(protect, admin);

// Dashboard
router.get("/dashboard",            getDashboardStats);

// Analytics
router.get("/analytics",            getAnalytics);

// Orders
router.get("/orders",               getAllOrders);
router.put("/orders/:id/status",    updateOrderStatus);

// Users
router.get("/users",                getUsers);
router.put("/users/:id/block",      toggleBlockUser);
router.delete("/users/:id",         deleteUser);

// Coupons
router.get("/coupons",              getCoupons);
router.post("/coupons",             createCoupon);
router.put("/coupons/:id",          updateCoupon);
router.delete("/coupons/:id",       deleteCoupon);

// Banners
router.get("/banners",              getAllBannersAdmin);
router.post("/banners",             createBanner);
router.put("/banners/:id",          updateBanner);
router.delete("/banners/:id",       deleteBanner);

// Reviews
router.get("/reviews",              getAllReviews);
router.delete("/reviews/:id",       deleteReview);

module.exports = router;
