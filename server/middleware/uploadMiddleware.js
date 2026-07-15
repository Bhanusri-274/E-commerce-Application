const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const { isCloudinaryConfigured } = require("../config/cloudinary");

let upload;

if (isCloudinaryConfigured) {
  /* ---- Cloudinary storage ---- */
  const { CloudinaryStorage } = require("multer-storage-cloudinary");
  const { cloudinary } = require("../config/cloudinary");

  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder:            "shopez",
      allowed_formats:   ["jpg", "jpeg", "png", "webp"],
      transformation:    [{ width: 1200, crop: "limit" }],
    },
  });
  upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
} else {
  /* ---- Local disk fallback ---- */
  const uploadsDir = path.join(__dirname, "..", "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename:    (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });

  upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = /jpeg|jpg|png|webp/;
      cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
    },
  });
}

module.exports = upload;
