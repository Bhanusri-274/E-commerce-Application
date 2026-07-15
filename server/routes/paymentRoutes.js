const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const { confirmCOD, verifyRazorpay, getPayment } = require("../controllers/paymentController");

const router = express.Router();
router.use(protect);

router.post("/cod/:orderId",       confirmCOD);
router.post("/razorpay/verify",    verifyRazorpay);
router.get("/:orderId",            getPayment);

module.exports = router;
