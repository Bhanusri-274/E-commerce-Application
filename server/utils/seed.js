require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User     = require("../models/User");
const Category = require("../models/Category");
const Product  = require("../models/Product");
const Banner   = require("../models/Banner");
const Coupon   = require("../models/Coupon");
const slugify = require("slugify");

const run = async () => {
  await connectDB();
  console.log("🌱 Seeding database...");

  await Promise.all([
    User.deleteMany(),
    Category.deleteMany(),
    Product.deleteMany(),
    Banner.deleteMany(),
    Coupon.deleteMany(),
  ]);

  // ── Users ──
  const admin = await User.create({
    name: "ShopEZ Admin", email: "admin@shopez.com",
    password: "admin123", role: "admin",
  });
  await User.create({
    name: "Rahul Sharma", email: "customer@shopez.com",
    password: "customer123", role: "customer", phone: "+91 98765 43210",
    addresses: [{
      label: "Home", fullName: "Rahul Sharma", phone: "+91 98765 43210",
      line1: "123, Green Park", city: "New Delhi", state: "Delhi",
      postalCode: "110016", country: "India", isDefault: true,
    }],
  });

  // ── Categories ──
  const cats = await Category.create([
  { name: "Electronics", description: "Phones, laptops, audio and more" },
  { name: "Fashion", description: "Clothing, footwear and accessories" },
  { name: "Home & Kitchen", description: "Furniture, decor and appliances" },
  { name: "Beauty", description: "Skincare, haircare and cosmetics" },
  { name: "Sports", description: "Fitness, outdoor and sports gear" },
  { name: "Books", description: "Fiction, non-fiction, academic" },
  { name: "Toys", description: "Toys and games for all ages" },
]);

  const [elec, fash, home, beau, sprt, book, toys] = cats;

  // ── Products ──
  const products = [
    // Electronics
    {
      name: "iPhone 15 (128GB) - Black",
      description: "Apple iPhone 15 with 6.1-inch Super Retina XDR display, A16 Bionic chip, advanced dual-camera system, USB-C connector, and up to 26 hours of video playback.",
      brand: "Apple", category: elec._id,
      price: 79900, discountPrice: 69990, stock: 512,
      images: [{ url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800" }],
      isFeatured: true, isFlashDeal: false, numSold: 245,
      specifications: [
        { key: "Display", value: '6.1" Super Retina XDR' },
        { key: "Chip", value: "A16 Bionic" },
        { key: "Camera", value: "48MP + 12MP" },
        { key: "Battery", value: "Up to 26 hrs" },
        { key: "Connector", value: "USB-C" },
      ],
      tags: ["iphone", "apple", "smartphone"],
    },
    {
      name: "Samsung Galaxy S24 (8GB/256GB)",
      description: "Samsung Galaxy S24 with Galaxy AI, 6.2-inch Dynamic AMOLED 2X display, Snapdragon 8 Gen 3 for Galaxy, 50MP camera.",
      brand: "Samsung", category: elec._id,
      price: 74999, discountPrice: 59999, stock: 320,
      images: [{ url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800" }],
      isFeatured: true, isFlashDeal: true, numSold: 198,
      specifications: [
        { key: "Display", value: '6.2" Dynamic AMOLED 2X' },
        { key: "Processor", value: "Snapdragon 8 Gen 3" },
        { key: "RAM", value: "8 GB" },
        { key: "Storage", value: "256 GB" },
        { key: "Battery", value: "4000 mAh" },
      ],
      tags: ["samsung", "galaxy", "android"],
    },
    {
      name: "boAt Rockerz 450 Bluetooth Headphones",
      description: "40mm dynamic drivers, 15H playback, foldable design, built-in mic, voice assistant support. Compatible with Alexa.",
      brand: "boAt", category: elec._id,
      price: 2499, discountPrice: 1299, stock: 450,
      images: [{ url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800" }],
      isFeatured: false, isFlashDeal: true, numSold: 867,
      specifications: [
        { key: "Driver Size", value: "40mm" },
        { key: "Playback", value: "15 hours" },
        { key: "Connectivity", value: "Bluetooth 5.0" },
        { key: "Weight", value: "220g" },
      ],
      tags: ["headphones", "boat", "bluetooth"],
    },
    {
      name: "Dell Inspiron 15 Laptop (i5/8GB/512GB)",
      description: "15.6-inch FHD display, Intel Core i5-13th Gen, 8GB DDR5 RAM, 512GB SSD, Windows 11, backlit keyboard.",
      brand: "Dell", category: elec._id,
      price: 65990, discountPrice: 54990, stock: 85,
      images: [{ url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800" }],
      isFeatured: true, isFlashDeal: false, numSold: 134,
      specifications: [
        { key: "Processor", value: "Intel i5 13th Gen" },
        { key: "RAM", value: "8 GB DDR5" },
        { key: "Storage", value: "512 GB SSD" },
        { key: "Display", value: '15.6" FHD' },
        { key: "OS", value: "Windows 11" },
      ],
      tags: ["laptop", "dell", "windows"],
    },
    {
      name: "Sony WH-CH520 Wireless Headphones",
      description: "Lightweight on-ear headphones with up to 50 hours battery, Multipoint connection, foldable design, USB-C charging.",
      brand: "Sony", category: elec._id,
      price: 5990, discountPrice: 3990, stock: 210,
      images: [{ url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800" }],
      isFeatured: false, isFlashDeal: true, numSold: 456,
      tags: ["sony", "headphones", "wireless"],
    },
    {
      name: "Apple Watch SE (2nd Gen) GPS",
      description: "The Apple Watch SE gives you the features that matter most. With a next-generation chip and crash detection.",
      brand: "Apple", category: elec._id,
      price: 29900, discountPrice: 24900, stock: 150,
      images: [{ url: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800" }],
      isFeatured: true, isFlashDeal: false, numSold: 312,
      tags: ["apple", "watch", "wearable"],
    },
    {
      name: "ASUS Vivobook 15 (Ryzen 5/8GB/512GB)",
      description: "ASUS Vivobook 15 with AMD Ryzen 5, 15.6-inch FHD display, 8GB RAM, 512GB SSD, Windows 11, ASUS Splendid technology.",
      brand: "ASUS", category: elec._id,
      price: 55990, discountPrice: 45990, stock: 60,
      images: [{ url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800" }],
      isFeatured: false, isFlashDeal: true, numSold: 89,
      tags: ["laptop", "asus", "amd"],
    },
    {
      name: "Fire-Boltt Ninja 3 Pro Smartwatch",
      description: "1.83-inch HD display, IP67 water resistant, 100+ sports modes, 24/7 health monitoring, 7-day battery life.",
      brand: "Fire-Boltt", category: elec._id,
      price: 3999, discountPrice: 1599, stock: 380,
      images: [{ url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800" }],
      isFeatured: false, isFlashDeal: true, numSold: 703,
      tags: ["smartwatch", "fire-boltt", "fitness"],
    },
    // Fashion
    {
      name: "Puma Black T-Shirt Classic",
      description: "100% cotton classic fit Puma t-shirt with embossed logo. Perfect for casual wear or working out.",
      brand: "Puma", category: fash._id,
      price: 1499, discountPrice: 899, stock: 300,
      images: [{ url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800" }],
      isFeatured: false, isFlashDeal: true, numSold: 521,
      tags: ["puma", "tshirt", "fashion"],
    },
    {
      name: "Nike Air Max Shoes",
      description: "Nike Air Max with visible Air cushioning, rubber outsole for traction, mesh upper for breathability.",
      brand: "Nike", category: fash._id,
      price: 8999, discountPrice: 4999, stock: 120,
      images: [{ url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800" }],
      isFeatured: true, isFlashDeal: true, numSold: 389,
      specifications: [
        { key: "Material", value: "Mesh + Synthetic" },
        { key: "Sole", value: "Rubber" },
        { key: "Closure", value: "Lace-up" },
      ],
      tags: ["nike", "shoes", "sneakers"],
    },
    // Home
    {
      name: "Minimalist Ceramic Vase Set (3 Pcs)",
      description: "Set of 3 matte ceramic vases in varying heights. Perfect for dried flowers, pampas grass, or as standalone decor.",
      brand: "Homely", category: home._id,
      price: 2999, discountPrice: 2199, stock: 80,
      images: [{ url: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800" }],
      isFeatured: true, isFlashDeal: false, numSold: 178,
      tags: ["vase", "decor", "home"],
    },
    // Beauty
    {
      name: "Vitamin C Brightening Serum 30ml",
      description: "20% Vitamin C + Hyaluronic Acid + Niacinamide. Brightens skin, fades dark spots, and boosts collagen production.",
      brand: "GlowLab", category: beau._id,
      price: 1299, discountPrice: 699, stock: 250,
      images: [{ url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800" }],
      isFeatured: false, isFlashDeal: true, numSold: 934,
      tags: ["serum", "skincare", "vitamin-c"],
    },
    // Sports
    {
      name: "Boldfit Gym Protein Shaker Bottle",
      description: "BPA-free 700ml shaker with stainless steel blender ball, leak-proof lid, measurement markings.",
      brand: "Boldfit", category: sprt._id,
      price: 499, discountPrice: 299, stock: 600,
      images: [{ url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800" }],
      isFeatured: false, isFlashDeal: true, numSold: 1243,
      tags: ["gym", "shaker", "fitness"],
    },
    {
      name: "Redmi 13C 6GB/128GB Smartphone",
      description: "MediaTek Helio G85, 6.74-inch HD+ display, 50MP AI triple camera, 5000 mAh battery, MIUI 14.",
      brand: "Redmi", category: elec._id,
      price: 12999, discountPrice: 8999, stock: 200,
      images: [{ url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800" }],
      isFeatured: false, isFlashDeal: true, numSold: 445,
      tags: ["redmi", "xiaomi", "smartphone"],
    },
    {
      name: "boAt Airdopes 141 TWS Earbuds",
      description: "BEAST MODE for gaming, 42H total playback, IPX4 water resistance, Bluetooth 5.1, ENx tech for calls.",
      brand: "boAt", category: elec._id,
      price: 2999, discountPrice: 1499, stock: 560,
      images: [{ url: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800" }],
      isFeatured: false, isFlashDeal: true, numSold: 1089,
      tags: ["earbuds", "boat", "tws"],
    },
    {
      name: "Lenovo IdeaPad Slim 3 (i3/8GB/256GB)",
      description: "Intel Core i3, 15.6-inch FHD anti-glare display, 8GB RAM, 256GB SSD, Wi-Fi 6, Windows 11 Home.",
      brand: "Lenovo", category: elec._id,
      price: 45990, discountPrice: 45990, stock: 70,
      images: [{ url: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800" }],
      isFeatured: false, isFlashDeal: false, numSold: 67,
      tags: ["lenovo", "laptop", "ideapad"],
    },
  ];

  await Product.create(products);

  // ── Banners ──
  await Banner.insertMany([
    {
      title: "Big Deals, Bigger Savings",
      subtitle: "Up to 50% OFF on Top Brands",
      image: { url: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1600" },
      position: "HERO", order: 1,
    },
    {
      title: "New Arrivals — Electronics",
      subtitle: "Latest phones, laptops & audio",
      image: { url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1600" },
      position: "HERO", order: 2,
    },
    {
      title: "Fashion Week Sale",
      subtitle: "Up to 70% off on top brands",
      image: { url: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600" },
      position: "HERO", order: 3,
    },
  ]);

  // ── Coupons ──
  await Coupon.insertMany([
    {
      code: "WELCOME10", description: "10% off for new users", discountType: "PERCENTAGE",
      discountValue: 10, minOrderValue: 500, maxDiscountAmount: 200,
      usageLimit: 100, expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
    {
      code: "FLAT200", description: "Flat ₹200 off on orders above ₹2000", discountType: "FLAT",
      discountValue: 200, minOrderValue: 2000,
      usageLimit: 50, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      code: "ELEC15", description: "15% off on electronics", discountType: "PERCENTAGE",
      discountValue: 15, minOrderValue: 5000, maxDiscountAmount: 1500,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  ]);

  console.log("\n✅ Seed complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("👤 Admin     → admin@shopez.com    / admin123");
  console.log("🛍️  Customer  → customer@shopez.com / customer123");
  console.log("🎟️  Coupons   → WELCOME10 | FLAT200 | ELEC15");
  console.log(`📦 Products  → ${products.length} products seeded`);
  console.log(`📂 Categories → ${cats.length} categories seeded`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => { console.error("❌ Seed failed:", err); process.exit(1); });
