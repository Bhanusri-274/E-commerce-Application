const express = require("express");
const { placeOrder, getMyOrders, getOrderById, cancelOrder } = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

router.post("/", placeOrder);
router.get("/my", getMyOrders);
router.get("/:id", getOrderById);
router.put("/:id/cancel", cancelOrder);

module.exports = router;
