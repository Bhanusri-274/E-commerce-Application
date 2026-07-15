const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  applyCoupon,
  removeCoupon,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", getCart);
router.post("/", addToCart);
router.put("/:itemId", updateCartItem);
router.delete("/:itemId", removeCartItem);
router.post("/apply-coupon", applyCoupon);
router.delete("/coupon", removeCoupon);

module.exports = router;
