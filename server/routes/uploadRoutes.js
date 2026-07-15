const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { uploadImage, uploadMultipleImages } = require("../controllers/uploadController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect, admin);

router.post("/", upload.single("image"), uploadImage);
router.post("/multiple", upload.array("images", 8), uploadMultipleImages);

module.exports = router;
