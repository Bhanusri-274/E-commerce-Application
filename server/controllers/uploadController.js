const asyncHandler = require("express-async-handler");
const { isCloudinaryConfigured } = require("../config/cloudinary");

const buildUrl = (req, file) => {
  if (isCloudinaryConfigured) {
    // Cloudinary path is already an HTTPS URL
    return file.path;
  }
  // Local: build an absolute URL the browser can reach
  const protocol = req.protocol;
  const host     = req.get("host");
  return `${protocol}://${host}/uploads/${file.filename}`;
};

// POST /api/upload  (field: image)
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No image file provided");
  }
  res.status(201).json({
    success: true,
    data: {
      url:       buildUrl(req, req.file),
      public_id: req.file.filename || req.file.public_id || "",
    },
  });
});

// POST /api/upload/multiple  (field: images)
const uploadMultipleImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error("No image files provided");
  }
  const data = req.files.map((f) => ({
    url:       buildUrl(req, f),
    public_id: f.filename || f.public_id || "",
  }));
  res.status(201).json({ success: true, data });
});

module.exports = { uploadImage, uploadMultipleImages };
