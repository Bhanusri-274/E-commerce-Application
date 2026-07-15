import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingCart } from "lucide-react";
import Rating from "./Rating";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const discountPercent =
    product.discountPrice > 0 && product.discountPrice < product.price
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;
  const saved = !!isInWishlist?.(product._id);

  const requireAuth = (action) => {
    if (!user) {
      toast.error("Please sign in to continue");
      navigate("/login");
      return;
    }
    action();
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="card-surface group relative overflow-hidden"
    >
      <button
        onClick={() => requireAuth(() => toggleWishlist(product._id))}
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-110"
        aria-label="Toggle wishlist"
      >
        <Heart size={16} className={saved ? "fill-[#EF4444] text-[#EF4444]" : "text-[#64748B]"} />
      </button>

      {discountPercent > 0 && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-[#F97316] px-2.5 py-1 text-xs font-semibold text-white">
          {discountPercent}% OFF
        </span>
      )}

      <Link to={`/products/${product.slug}`} className="block">
        <div className="aspect-square w-full overflow-hidden bg-[#F8FAFC]">
          <img
            src={product.images?.[0]?.url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="space-y-1.5 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[#64748B]">{product.brand}</p>
          <h3 className="line-clamp-1 font-display text-sm font-semibold text-[#0F172A]">{product.name}</h3>
          <Rating value={product.ratingsAverage} count={product.ratingsCount} />
          <div className="flex items-center gap-2 pt-1">
            <span className="font-display text-base font-bold text-[#0F172A]">{formatPrice(effectivePrice)}</span>
            {discountPercent > 0 && (
              <span className="text-xs text-[#64748B] line-through">{formatPrice(product.price)}</span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <button
          onClick={() => requireAuth(() => addToCart(product._id, 1))}
          disabled={product.stock === 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F172A] py-2.5 text-sm font-semibold text-white transition hover:bg-[#2563EB] disabled:bg-[#94A3B8]"
        >
          <ShoppingCart size={15} />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
