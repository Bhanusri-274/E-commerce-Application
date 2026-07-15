import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import EmptyState from "../../components/common/EmptyState";
import ProductCard from "../../components/common/ProductCard";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const { wishlist, toggleWishlist }  = useWishlist();
  const { addToCart }                  = useCart();
  const { user }                       = useAuth();
  const navigate                       = useNavigate();

  const requireAuth = (fn) => {
    if (!user) { toast.error("Please sign in"); navigate("/login"); return; }
    fn();
  };

  const moveToCart = async (product) => {
    requireAuth(async () => {
      await addToCart(product._id, 1);
      await toggleWishlist(product._id); // remove from wishlist
      toast.success("Moved to cart!");
    });
  };

  const products = wishlist?.products || [];

  if (products.length === 0) {
    return (
      <div className="section-container py-16">
        <EmptyState icon={Heart} title="Your wishlist is empty"
          description="Save items you love to find them easily later. Click the ♥ on any product to add it here."
          actionLabel="Discover Products" actionTo="/products" />
      </div>
    );
  }

  return (
    <div className="section-container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">My Wishlist</h1>
          <p className="text-sm text-[#64748B]">{products.length} item{products.length > 1 ? "s" : ""} saved</p>
        </div>
        <button onClick={() => requireAuth(async () => {
          for (const p of products) await toggleWishlist(p._id);
          toast.success("Wishlist cleared");
        })} className="btn-secondary !py-2 text-sm text-[#EF4444] hover:!border-[#EF4444] hover:!text-[#EF4444]">
          <Trash2 size={14}/> Clear All
        </button>
      </div>

      <AnimatePresence>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <motion.div key={p._id} layout exit={{ opacity:0, scale:0.9 }}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default Wishlist;
