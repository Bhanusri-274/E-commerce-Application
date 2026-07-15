const asyncHandler = require("express-async-handler");
const Banner = require("../models/Banner");

const getBanners = asyncHandler(async (req, res) => {
  const query = { isActive: true };
  if (req.query.position) query.position = req.query.position;
  const banners = await Banner.find(query).sort({ order: 1 });
  res.json({ success: true, data: banners });
});

const getAllBannersAdmin = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort({ order: 1 });
  res.json({ success: true, data: banners });
});

const createBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.create(req.body);
  res.status(201).json({ success: true, data: banner });
});

const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    res.status(404);
    throw new Error("Banner not found");
  }
  Object.assign(banner, req.body);
  await banner.save();
  res.json({ success: true, data: banner });
});

const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    res.status(404);
    throw new Error("Banner not found");
  }
  await banner.deleteOne();
  res.json({ success: true, message: "Banner removed" });
});

module.exports = { getBanners, getAllBannersAdmin, createBanner, updateBanner, deleteBanner };
