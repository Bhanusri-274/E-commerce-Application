const express = require("express");
const {
  getProducts,
  getProductByIdentifier,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
} = require("../controllers/productController");
const { getProductReviews, createReview } = require("../controllers/reviewController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getProducts);
router.get("/:identifier", getProductByIdentifier);

router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.patch("/:id/stock", protect, admin, updateStock);

router.get("/:productId/reviews", getProductReviews);
router.post("/:productId/reviews", protect, createReview);

module.exports = router;
