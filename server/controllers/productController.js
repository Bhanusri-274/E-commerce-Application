const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");

// @desc Get products with search/filter/sort/pagination
// @route GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    sort,
    page = 1,
    limit = 12,
    featured,
    flashDeal,
  } = req.query;

  const query = { isActive: true };

  if (keyword) query.$text = { $search: keyword };
  if (category) query.category = category;
  if (brand) query.brand = { $in: brand.split(",") };
  if (rating) query.ratingsAverage = { $gte: Number(rating) };
  if (featured === "true") query.isFeatured = true;
  if (flashDeal === "true") query.isFlashDeal = true;

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort === "price_asc") sortOption = { price: 1 };
  if (sort === "price_desc") sortOption = { price: -1 };
  if (sort === "rating") sortOption = { ratingsAverage: -1 };
  if (sort === "newest") sortOption = { createdAt: -1 };
  if (sort === "bestselling") sortOption = { numSold: -1 };

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  });
});

// @desc Get single product by slug or id
// @route GET /api/products/:identifier
const getProductByIdentifier = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);

  const product = await Product.findOne(
    isObjectId ? { _id: identifier } : { slug: identifier }
  ).populate("category", "name slug");

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  }).limit(8);

  res.json({ success: true, data: product, related: relatedProducts });
});

// @desc Create product (admin)
// @route POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

// @desc Update product (admin)
// @route PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  Object.assign(product, req.body);
  await product.save();
  res.json({ success: true, data: product });
});

// @desc Delete product (admin)
// @route DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  await product.deleteOne();
  res.json({ success: true, message: "Product removed" });
});

// @desc Update stock (admin)
// @route PATCH /api/products/:id/stock
const updateStock = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  product.stock = req.body.stock;
  await product.save();
  res.json({ success: true, data: product });
});

module.exports = {
  getProducts,
  getProductByIdentifier,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
};
