const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    image: {
      url: { type: String, required: true },
      public_id: { type: String, default: "" },
    },
    link: { type: String, default: "" },
    position: { type: String, enum: ["HERO", "PROMO"], default: "HERO" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
