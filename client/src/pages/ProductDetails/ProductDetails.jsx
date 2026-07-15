import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Minus, Plus, ShieldCheck, Truck, RotateCcw, Star, ChevronRight, Share2 } from "lucide-react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from "chart.js";
import toast from "react-hot-toast";
import Rating from "../../components/common/Rating";
import ProductCard from "../../components/common/ProductCard";
import Loader from "../../components/common/Loader";
import Breadcrumb from "../../components/common/Breadcrumb";
import { productService } from "../../services";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { trackRecentlyViewed } from "../Home/Home";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

const formatPrice = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const generatePriceHistory = (currentPrice) => {
  const months = ["20 Apr", "27 Apr", "4 May", "11 May", "18 May"];
  return months.map((label, i) => ({
    label,
    price: Math.round(currentPrice * (0.88 + Math.random() * 0.24)),
  }));
};

const ProductDetails = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct]       = useState(null);
  const [related, setRelated]       = useState([]);
  const [reviews, setReviews]       = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity]     = useState(1);
  const [loading, setLoading]       = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [activeTab, setActiveTab]   = useState("details");
  const [chartRange, setChartRange] = useState("30 Days");

  const loadProduct = () => {
    setLoading(true);
    productService.getOne(identifier)
      .then((res) => {
        const p = res.data;
        setProduct(p);
        setRelated(res.related);
        setActiveImage(0);
        setQuantity(1);
        setPriceHistory(generatePriceHistory(p.discountPrice > 0 ? p.discountPrice : p.price));
        trackRecentlyViewed(p);
        return productService.reviews(p._id);
      })
      .then((res) => setReviews(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProduct(); window.scrollTo(0, 0); }, [identifier]);

  if (loading || !product) return <Loader fullScreen />;

  const effectivePrice   = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discountPercent  = product.discountPercent || 0;

  const requireAuth = (fn) => {
    if (!user) { toast.error("Please sign in to continue"); navigate("/login"); return; }
    fn();
  };

  const handleBuyNow = () => requireAuth(async () => {
    await addToCart(product._id, quantity);
    navigate("/checkout");
  });

  const submitReview = async (e) => {
    e.preventDefault();
    requireAuth(async () => {
      try {
        await productService.addReview(product._id, reviewForm);
        toast.success("Review submitted!");
        setReviewForm({ rating: 5, title: "", comment: "" });
        loadProduct();
      } catch (err) {
        toast.error(err.response?.data?.message || "Could not submit review");
      }
    });
  };

  const chartData = {
    labels: priceHistory.map((p) => p.label),
    datasets: [{
      label: "Price (₹)",
      data: priceHistory.map((p) => p.price),
      borderColor: "#2563EB",
      backgroundColor: "rgba(37,99,235,0.08)",
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "#2563EB",
      pointRadius: 4,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `₹${ctx.raw.toLocaleString("en-IN")}` } } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { color: "#F1F5F9" }, ticks: { font: { size: 10 }, callback: (v) => `₹${(v/1000).toFixed(0)}k` } },
    },
  };

  const mockColors  = ["Black", "Silver", "Blue"];
  const mockStorage = ["128GB", "256GB", "512GB"];
  const hasVariants = product.specifications?.some((s) => ["Color", "Storage", "Size"].includes(s.key));
  const specs       = showAllSpecs ? product.specifications : product.specifications?.slice(0, 4);

  const ratingBreakdown = [
    { star: 5, pct: 75 }, { star: 4, pct: 15 }, { star: 3, pct: 7 }, { star: 2, pct: 2 }, { star: 1, pct: 1 },
  ];

  return (
    <div className="section-container py-5">
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { to: "/", label: "Home" },
        { to: `/products?category=${product.category?._id}`, label: product.category?.name || "Products" },
        { label: product.name },
      ]} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[420px_1fr]">
        {/* --- Left: Images --- */}
        <div>
          <div className="card-surface group relative aspect-square overflow-hidden p-2">
            <motion.img
              key={activeImage}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={product.images?.[activeImage]?.url}
              alt={product.name}
              className="h-full w-full rounded-xl object-contain"
            />
            {discountPercent > 0 && (
              <span className="absolute left-4 top-4 rounded-full bg-[#F97316] px-2.5 py-1 text-xs font-bold text-white">
                {discountPercent}% OFF
              </span>
            )}
            <button
              onClick={() => requireAuth(() => toggleWishlist(product._id))}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-110"
            >
              <Heart size={16} className={isInWishlist(product._id) ? "fill-[#EF4444] text-[#EF4444]" : "text-[#64748B]"} />
            </button>
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${activeImage === i ? "border-[#2563EB]" : "border-[#E2E8F0]"}`}>
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- Right: Details --- */}
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">{product.brand}</p>
          <h1 className="font-display text-xl font-bold text-[#0F172A] sm:text-2xl">{product.name}</h1>

          {/* Rating row */}
          <div className="flex flex-wrap items-center gap-3">
            <Rating value={product.ratingsAverage} count={product.ratingsCount} size={15} />
            <span className="rounded-full bg-[#22C55E1A] px-2 py-0.5 text-xs font-semibold text-[#22C55E]">
              {product.numSold || 0} sold
            </span>
            <button className="ml-auto text-[#64748B] hover:text-[#2563EB]"><Share2 size={17} /></button>
          </div>

          {/* Price */}
          <div className="flex flex-wrap items-end gap-3 rounded-xl bg-[#F8FAFC] px-4 py-3">
            <span className="font-display text-3xl font-bold text-[#EF4444]">{formatPrice(effectivePrice)}</span>
            {discountPercent > 0 && (
              <>
                <span className="text-base text-[#94A3B8] line-through">{formatPrice(product.price)}</span>
                <span className="rounded-full bg-[#EF44441A] px-2 py-0.5 text-xs font-bold text-[#EF4444]">{discountPercent}% OFF</span>
              </>
            )}
          </div>
          <p className="text-xs text-[#64748B]">Inclusive of all taxes</p>

          {/* Stock */}
          <p className={`text-sm font-semibold ${product.stock > 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
            {product.stock > 0 ? "✓ In Stock" : "✗ Out of Stock"}
          </p>

          {/* Storage Variants */}
          {hasVariants && (
            <div>
              <p className="mb-2 text-sm font-semibold text-[#0F172A]">Storage:</p>
              <div className="flex flex-wrap gap-2">
                {mockStorage.map((s) => (
                  <button key={s} onClick={() => setSelectedStorage(s)}
                    className={`rounded-xl border-2 px-4 py-1.5 text-sm font-semibold transition ${selectedStorage === s ? "border-[#2563EB] bg-[#2563EB0D] text-[#2563EB]" : "border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB]"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Variants */}
          {hasVariants && (
            <div>
              <p className="mb-2 text-sm font-semibold text-[#0F172A]">Color: <span className="font-normal text-[#64748B]">{selectedColor || "Select color"}</span></p>
              <div className="flex gap-2">
                {[{ name: "Black", hex: "#1e293b" }, { name: "Silver", hex: "#94a3b8" }, { name: "Blue", hex: "#2563EB" }].map((c) => (
                  <button key={c.name} onClick={() => setSelectedColor(c.name)} title={c.name}
                    className={`h-9 w-9 rounded-full border-4 transition ${selectedColor === c.name ? "border-[#2563EB] scale-110" : "border-[#E2E8F0]"}`}
                    style={{ backgroundColor: c.hex }} />
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <p className="text-sm font-semibold text-[#0F172A]">Quantity:</p>
            <div className="flex items-center overflow-hidden rounded-xl border border-[#E2E8F0]">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-4 py-2.5 text-[#64748B] hover:bg-[#F8FAFC]"><Minus size={14} /></button>
              <span className="w-10 text-center text-sm font-bold">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="px-4 py-2.5 text-[#64748B] hover:bg-[#F8FAFC]"><Plus size={14} /></button>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button disabled={product.stock === 0} onClick={() => requireAuth(() => addToCart(product._id, quantity))}
              className="btn-secondary flex-1 disabled:opacity-40">
              Add to Cart
            </button>
            <button disabled={product.stock === 0} onClick={handleBuyNow} className="btn-primary flex-1 disabled:opacity-40">
              Buy Now
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-[#E2E8F0] p-4">
            {[{ icon: Truck, title: "Free Delivery", sub: "On orders above ₹499" },
              { icon: RotateCcw, title: "30 Days Returns", sub: "Easy return policy" },
              { icon: ShieldCheck, title: "Secure Payment", sub: "100% secure payments" }].map((f) => (
              <div key={f.title} className="flex flex-col items-center gap-1 text-center">
                <f.icon size={18} className="text-[#22C55E]" />
                <p className="text-xs font-semibold text-[#0F172A]">{f.title}</p>
                <p className="text-[10px] text-[#64748B]">{f.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- Tabs: Details / Price History / Reviews --- */}
      <div className="mt-10">
        <div className="flex gap-1 border-b border-[#E2E8F0]">
          {["details", "price-history", "reviews"].map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`border-b-2 px-5 py-3 text-sm font-semibold capitalize transition ${activeTab === t ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-[#64748B]"}`}>
              {t === "price-history" ? "Price History" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Details tab */}
        {activeTab === "details" && (
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
            <div>
              <h3 className="mb-3 font-display text-lg font-semibold text-[#0F172A]">Product Details</h3>
              <p className="leading-relaxed text-[#64748B]">{product.description}</p>
              {product.specifications?.length > 0 && (
                <div className="mt-6 space-y-2">
                  {specs.map((s, i) => (
                    <div key={i} className="flex gap-4 rounded-xl bg-[#F8FAFC] px-4 py-2.5 text-sm">
                      <span className="w-40 shrink-0 font-medium text-[#64748B]">{s.key}</span>
                      <span className="text-[#0F172A]">{s.value}</span>
                    </div>
                  ))}
                  {product.specifications.length > 4 && (
                    <button onClick={() => setShowAllSpecs((v) => !v)} className="flex items-center gap-1 text-sm font-semibold text-[#2563EB]">
                      {showAllSpecs ? "View Less" : `+ View More (${product.specifications.length - 4})`}
                      <ChevronRight size={14} className={showAllSpecs ? "rotate-90" : ""} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Price History tab */}
        {activeTab === "price-history" && (
          <div className="mt-6 card-surface p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display font-semibold text-[#0F172A]">Price History</h3>
              <div className="flex gap-1">
                {["30 Days", "3 Months", "6 Months", "1 Year"].map((r) => (
                  <button key={r} onClick={() => setChartRange(r)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${chartRange === r ? "bg-[#2563EB] text-white" : "bg-[#F8FAFC] text-[#64748B]"}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <Line data={chartData} options={chartOptions} />
          </div>
        )}

        {/* Reviews tab */}
        {activeTab === "reviews" && (
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
            {/* Rating summary */}
            <div className="card-surface p-5">
              <div className="text-center">
                <p className="font-display text-5xl font-bold text-[#0F172A]">{product.ratingsAverage?.toFixed(1) || "0.0"}</p>
                <Rating value={product.ratingsAverage} size={18} />
                <p className="mt-1 text-sm text-[#64748B]">{product.ratingsCount} Reviews</p>
              </div>
              <div className="mt-5 space-y-2">
                {ratingBreakdown.map((r) => (
                  <div key={r.star} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-[#64748B]">{r.star}</span>
                    <Star size={10} className="fill-[#FACC15] text-[#FACC15]" />
                    <div className="flex-1 overflow-hidden rounded-full bg-[#F1F5F9]">
                      <div className="h-2 rounded-full bg-[#FACC15]" style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className="w-7 text-right text-[#64748B]">{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              {/* Write review form */}
              <form onSubmit={submitReview} className="card-surface mb-5 space-y-3 p-5">
                <p className="font-display font-semibold text-[#0F172A]">Write a Review</p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((r) => (
                    <button type="button" key={r} onClick={() => setReviewForm((f) => ({ ...f, rating: r }))}>
                      <Star size={22} className={r <= reviewForm.rating ? "fill-[#FACC15] text-[#FACC15]" : "text-[#E2E8F0] fill-[#E2E8F0]"} />
                    </button>
                  ))}
                </div>
                <input value={reviewForm.title} onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Review title" className="input-field" />
                <textarea required value={reviewForm.comment} onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                  placeholder="Share your experience..." rows={3} className="input-field" />
                <button className="btn-primary !px-5 !py-2 text-sm">Submit Review</button>
              </form>

              {/* Review list */}
              <div className="space-y-4">
                {reviews.length === 0 && <p className="text-sm text-[#64748B]">No reviews yet — be the first!</p>}
                {reviews.map((r) => (
                  <div key={r._id} className="card-surface p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#0F172A]">{r.user?.name}</p>
                        <Rating value={r.rating} size={13} />
                      </div>
                      {r.isVerifiedPurchase && (
                        <span className="rounded-full bg-[#22C55E1A] px-2 py-0.5 text-xs font-semibold text-[#22C55E]">Verified Purchase</span>
                      )}
                    </div>
                    {r.title && <p className="mt-2 text-sm font-semibold text-[#0F172A]">{r.title}</p>}
                    <p className="mt-1 text-sm text-[#64748B]">{r.comment}</p>
                    <p className="mt-2 text-xs text-[#94A3B8]">{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-14">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-[#0F172A]">You May Also Like</h2>
            <Link to={`/products?category=${product.category?._id}`} className="text-sm font-semibold text-[#2563EB]">View All →</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
