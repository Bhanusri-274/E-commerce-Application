const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    brand: { type: String, default: "Generic" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, default: "" },
      },
    ],
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    sku: { type: String, unique: true, sparse: true },
    specifications: [{ key: String, value: String }],
    tags: [String],
    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0 },
    numSold: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isFlashDeal: { type: Boolean, default: false },
    flashDealEndsAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", brand: "text", tags: "text" });

productSchema.virtual("discountPercent").get(function () {
  if (!this.discountPrice || this.discountPrice >= this.price) return 0;
  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = `${slugify(this.name, { lower: true, strict: true })}-${Date.now().toString(36)}`;
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
