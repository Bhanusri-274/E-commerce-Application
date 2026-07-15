require("dotenv").config();
const express = require("express");
const path    = require("path");
const cors    = require("cors");
const helmet  = require("helmet");
const morgan  = require("morgan");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

connectDB();

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

// Serve locally uploaded images (fallback when Cloudinary is not configured)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health
app.get("/api/health", (_req, res) =>
  res.json({ success: true, message: "ShopEZ API is running 🛍️" })
);

// --- Routes ---
app.use("/api/auth",           require("./routes/authRoutes"));
app.use("/api/users",          require("./routes/userRoutes"));
app.use("/api/products",       require("./routes/productRoutes"));
app.use("/api/categories",     require("./routes/categoryRoutes"));
app.use("/api/cart",           require("./routes/cartRoutes"));
app.use("/api/wishlist",       require("./routes/wishlistRoutes"));
app.use("/api/orders",         require("./routes/orderRoutes"));
app.use("/api/banners",        require("./routes/bannerRoutes"));
app.use("/api/payments",       require("./routes/paymentRoutes"));
app.use("/api/notifications",  require("./routes/notificationRoutes"));
app.use("/api/upload",         require("./routes/uploadRoutes"));
app.use("/api/admin",          require("./routes/adminRoutes"));

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`\n🛍️  ShopEZ server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`)
);
