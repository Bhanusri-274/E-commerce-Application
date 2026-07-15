import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import EmptyState from "../../components/common/EmptyState";
import { useCart } from "../../context/CartContext";

const fmtPrice = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const Cart = () => {
  const { cart, subtotal, updateQuantity, removeItem, applyCoupon, removeCoupon } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [applying, setApplying]     = useState(false);
  const navigate = useNavigate();

  const discount = cart.coupon?.discountAmount || 0;
  const shipping = subtotal - discount >= 999 || subtotal === 0 ? 0 : 49;
  const total    = Math.max(subtotal - discount + shipping, 0);

  const handleApply = async () => {
    if (!couponCode.trim()) return;
    setApplying(true);
    try { await applyCoupon(couponCode.trim()); setCouponCode(""); }
    catch (err) { toast.error(err.response?.data?.message || "Invalid coupon code"); }
    finally { setApplying(false); }
  };

  if (!cart.items?.length) {
    return (
      <div className="section-container py-16">
        <EmptyState icon={ShoppingBag} title="Your cart is empty"
          description="Looks like you haven't added anything yet. Explore our products and find something you love."
          actionLabel="Start Shopping" actionTo="/products" />
      </div>
    );
  }

  return (
    <div className="section-container py-8">
      {/* Breadcrumb */}
      <div className="mb-5 flex items-center gap-1.5 text-sm text-[#64748B]">
        <Link to="/" className="hover:text-[#2563EB]">Home</Link>
        <ChevronRight size={13}/>
        <span className="font-medium text-[#0F172A]">Shopping Cart</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-[#0F172A]">Shopping Cart</h1>
        <span className="text-sm text-[#64748B]">{cart.items.length} item{cart.items.length > 1 ? "s" : ""}</span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        {/* Items */}
        <div className="space-y-3">
          <AnimatePresence>
            {cart.items.map((item) => (
              <motion.div key={item._id}
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, x:-20 }}
                className="card-surface flex gap-4 p-4">
                <Link to={`/products/${item.product?.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F8FAFC]">
                  <img src={item.product?.images?.[0]?.url} alt={item.product?.name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-2">
                    <div>
                      <Link to={`/products/${item.product?.slug}`} className="font-display text-sm font-semibold text-[#0F172A] hover:text-[#2563EB]">
                        {item.product?.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-[#64748B]">{item.product?.brand}</p>
                    </div>
                    <button onClick={() => removeItem(item._id)} className="h-fit rounded-lg p-1 text-[#94A3B8] hover:bg-[#EF44441A] hover:text-[#EF4444]">
                      <Trash2 size={15}/>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center overflow-hidden rounded-xl border border-[#E2E8F0]">
                      <button onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))} className="px-3 py-1.5 text-[#64748B] hover:bg-[#F8FAFC]"><Minus size={13}/></button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-3 py-1.5 text-[#64748B] hover:bg-[#F8FAFC]"><Plus size={13}/></button>
                    </div>
                    <p className="font-display font-bold text-[#0F172A]">{fmtPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Continue shopping */}
          <Link to="/products" className="flex items-center gap-1 text-sm font-semibold text-[#2563EB]">
            ← Continue Shopping
          </Link>
        </div>

        {/* Order summary */}
        <div className="card-surface h-fit space-y-4 p-5">
          <h3 className="font-display text-lg font-semibold text-[#0F172A]">Order Summary</h3>

          {/* Coupon */}
          {!cart.coupon?.code ? (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"/>
                <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleApply()}
                  placeholder="Enter coupon code" className="input-field !py-2.5 pl-9 text-sm font-mono" />
              </div>
              <button onClick={handleApply} disabled={applying} className="btn-primary !px-4 !py-2 text-sm">
                {applying ? "…" : "Apply"}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl bg-[#22C55E1A] px-3 py-2.5">
              <div>
                <p className="text-sm font-bold text-[#22C55E]">🎟 {cart.coupon.code}</p>
                <p className="text-xs text-[#22C55E]">You saved {fmtPrice(discount)}!</p>
              </div>
              <button onClick={removeCoupon} className="text-xs font-semibold text-[#22C55E] underline">Remove</button>
            </div>
          )}

          {/* Price breakdown */}
          <div className="space-y-2 border-t border-[#E2E8F0] pt-4 text-sm">
            <div className="flex justify-between text-[#64748B]"><span>Subtotal ({cart.items.length} items)</span><span>{fmtPrice(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-[#22C55E]"><span>Discount</span><span>–{fmtPrice(discount)}</span></div>}
            <div className="flex justify-between text-[#64748B]">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span className="font-semibold text-[#22C55E]">FREE</span> : fmtPrice(shipping)}</span>
            </div>
            {shipping > 0 && <p className="text-xs text-[#94A3B8]">Add {fmtPrice(999 - (subtotal - discount))} more for free shipping</p>}
            <div className="flex justify-between border-t border-[#E2E8F0] pt-3 font-display text-lg font-bold text-[#0F172A]">
              <span>Total</span><span>{fmtPrice(total)}</span>
            </div>
          </div>

          <button onClick={() => navigate("/checkout")} className="btn-primary flex w-full items-center justify-center gap-2 !py-3">
            Proceed to Checkout <ArrowRight size={16}/>
          </button>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 border-t border-[#E2E8F0] pt-3 text-center text-[10px] text-[#64748B]">
            <div>🔒<br/>Secure</div>
            <div>📦<br/>Fast Delivery</div>
            <div>↩️<br/>Easy Return</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
