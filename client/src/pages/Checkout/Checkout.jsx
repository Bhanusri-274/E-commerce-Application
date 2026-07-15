import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { MapPin, Truck, Wallet, CreditCard, CheckCircle2, ChevronRight, Edit2 } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { orderService, userService } from "../../services"; // <-- Imported userService here

const formatPrice = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const STEPS = [
  { id: 1, label: "Address",  icon: MapPin },
  { id: 2, label: "Delivery", icon: Truck },
  { id: 3, label: "Payment",  icon: Wallet },
  { id: 4, label: "Review",   icon: CheckCircle2 },
];

const StepIndicator = ({ current }) => (
  <div className="mb-8 flex items-center justify-center">
    {STEPS.map((step, i) => (
      <div key={step.id} className="flex items-center">
        <div className="flex flex-col items-center gap-1">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${
            current > step.id  ? "border-[#22C55E] bg-[#22C55E] text-white"
            : current === step.id ? "border-[#2563EB] bg-[#2563EB] text-white shadow-lg shadow-[#2563EB40]"
            : "border-[#E2E8F0] bg-white text-[#94A3B8]"
          }`}>
            {current > step.id ? <CheckCircle2 size={16} /> : <step.icon size={16} />}
          </div>
          <span className={`text-[10px] font-semibold ${current >= step.id ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>
            {step.label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div className={`mb-4 h-0.5 w-16 transition-all sm:w-24 ${current > step.id ? "bg-[#22C55E]" : "bg-[#E2E8F0]"}`} />
        )}
      </div>
    ))}
  </div>
);

const Checkout = () => {
  const { cart, subtotal: cartSubtotal, refreshCart } = useCart();
  const { user } = useAuth(); // assuming user object from context has an array called user.addresses
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep]          = useState(1);
  const [paymentMethod, setPM]   = useState("COD");
  const [deliveryType, setDT]    = useState("standard");
  const [placing, setPlacing]    = useState(false);
  const [savedAddress, setSaved] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user?.name || "", 
      phone: user?.phone || "",
      line1: "", line2: "", city: "", state: "", postalCode: "", country: "India",
    },
  });

  // Handle single item buy vs full cart buy logic safely
  const isSingleItemCheckout = !!location.state?.checkoutItems;
  const checkoutItems = isSingleItemCheckout ? location.state.checkoutItems : (cart.items || []);
  const subtotal = isSingleItemCheckout 
    ? checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0) 
    : cartSubtotal;

  // Calculate prices dynamic with delivery types logic
const discount = cart.coupon?.discountAmount || 0;

// FIX: Set shipping cost strictly based on the user's explicit selection
let shipping = 0; // Default to 0 for "standard" delivery
if (deliveryType === "express") {
  shipping = 99; // Explicit premium delivery fee
}
  
  const total = Math.max(subtotal - discount + shipping, 0);

  // FIX: This now checks your database endpoint `userService.addAddress`
  const handleAddressNext = handleSubmit(async (data) => { 
    setSaved(data); 

    // Auto-saves address ONLY if the user doesn't already have one stored in profile
    const hasSavedAddresses = user?.addresses && user.addresses.length > 0;
    if (!hasSavedAddresses) {
      try {
        const newAddressPayload = {
          label: "Home",
          fullName: data.fullName,
          phone: data.phone,
          line1: data.line1,
          line2: data.line2 || "",
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country || "India"
        };

        await userService.addAddress(newAddressPayload); 
        toast.success("Address saved to your profile for future checkouts! 🏠");
      } catch (err) {
        console.error("Auto-address save background failure:", err);
      }
    }
    setStep(2); 
  });

  const selectSavedAddress = (address) => {
    const formattedAddress = {
      fullName: address.fullName || user?.name || "",
      phone: address.phone || user?.phone || "",
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country || "India"
    };
    setSaved(formattedAddress);
    reset(formattedAddress);
    setStep(2);
  };

  const placeOrder = async () => {
    try {
      setPlacing(true);
      
      // Build proper response payload tracking items
      const orderPayload = {
        shippingAddress: savedAddress,
        paymentMethod,
        deliveryType,
        // If single checkout item was intercepted, explicitly forward item configuration to the endpoint array
        items: isSingleItemCheckout ? checkoutItems.map(i => ({ product: i.product._id, quantity: i.quantity, price: i.price })) : undefined
      };

      const res = await orderService.place(orderPayload);
      await refreshCart();
      toast.success("Order placed successfully! 🎉");
      
      // Axios handles payload return parsing as data directly from your service helper configurations
      navigate(`/orders/${res._id || res.data?._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not place order");
    } finally { setPlacing(false); }
  };

  if (!checkoutItems || checkoutItems.length === 0) {
    navigate("/cart"); 
    return null;
  }

  return (
    <div className="section-container py-8">
      <h1 className="mb-6 text-center font-display text-2xl font-bold text-[#0F172A]">Checkout</h1>
      <StepIndicator current={step} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {/* Step 1: Address Input */}
          <div className={`card-surface overflow-hidden transition-all duration-300 ${step !== 1 ? "opacity-70" : ""}`}>
            <div className="flex items-center justify-between border-b border-[#E2E8F0] p-5">
              <div className="flex items-center gap-2">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step >= 1 ? "bg-[#2563EB] text-white" : "bg-[#F1F5F9] text-[#94A3B8]"}`}>1</span>
                <h3 className="font-display font-semibold text-[#0F172A]">Shipping Address</h3>
              </div>
              {step > 1 && savedAddress && (
                <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs font-semibold text-[#2563EB]">
                  <Edit2 size={12} /> Change
                </button>
              )}
            </div>

            {step === 1 && (
              <form onSubmit={handleAddressNext} className="p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#64748B]">Full Name *</label>
                    <input {...register("fullName", { required: "Full name is required" })} placeholder="Rahul Sharma" className="input-field" />
                    {errors.fullName && <p className="mt-1 text-xs text-[#EF4444]">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#64748B]">Phone *</label>
                    <input 
                      {...register("phone", { 
                        required: "Phone number is required",
                        pattern: {
                          value: /^[0-9+() \s-]{10,14}$/,
                          message: "Please enter a valid phone number"
                        }
                      })} 
                      placeholder="9876543210" 
                      className="input-field" 
                    />
                    {errors.phone && <p className="mt-1 text-xs text-[#EF4444]">{errors.phone.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-[#64748B]">Address Line 1 *</label>
                    <input {...register("line1", { required: "Address line 1 is required" })} placeholder="123, Green Park" className="input-field" />
                    {errors.line1 && <p className="mt-1 text-xs text-[#EF4444]">{errors.line1.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-[#64748B]">Address Line 2</label>
                    <input {...register("line2")} placeholder="Apartment, floor, landmark (optional)" className="input-field" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#64748B]">City *</label>
                    <input {...register("city", { required: "City is required" })} placeholder="New Delhi" className="input-field" />
                    {errors.city && <p className="mt-1 text-xs text-[#EF4444]">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#64748B]">State *</label>
                    <input {...register("state", { required: "State is required" })} placeholder="Delhi" className="input-field" />
                    {errors.state && <p className="mt-1 text-xs text-[#EF4444]">{errors.state.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#64748B]">Postal Code *</label>
                    <input 
                      {...register("postalCode", { 
                        required: "Postal code is required",
                        pattern: {
                          value: /^[1-9][0-9]{5}$/,
                          message: "Enter a valid 6-digit PIN code"
                        }
                      })} 
                      placeholder="110016" 
                      className="input-field" 
                    />
                    {errors.postalCode && <p className="mt-1 text-xs text-[#EF4444]">{errors.postalCode.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#64748B]">Country</label>
                    <input {...register("country")} className="input-field" readOnly />
                  </div>
                </div>

                {/* Database Saved Address Selector */}
                {user?.addresses?.length > 0 && (
                  <div className="mt-4 border-t border-[#E2E8F0] pt-4">
                    <p className="mb-2 text-xs font-semibold text-[#64748B]">Or choose a saved address:</p>
                    <div className="space-y-2">
                      {user.addresses.map((a) => (
                        <button 
                          key={a._id} 
                          type="button"
                          onClick={() => selectSavedAddress(a)}
                          className="w-full rounded-xl border border-[#E2E8F0] p-3 text-left text-xs text-[#64748B] hover:border-[#2563EB] hover:bg-[#F8FAFC] transition"
                        >
                          <span className="font-semibold text-[#0F172A]">{a.label || "Saved Address"}</span> — {a.fullName || user.name}, {a.line1}, {a.city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button type="submit" className="btn-primary mt-5 w-full">
                  Continue to Delivery <ChevronRight size={16} />
                </button>
              </form>
            )}

            {step > 1 && savedAddress && (
              <div className="px-5 py-3 text-sm text-[#64748B]">
                <p className="font-semibold text-[#0F172A]">{savedAddress.fullName}</p>
                <p>{savedAddress.line1}{savedAddress.line2 ? `, ${savedAddress.line2}` : ""}, {savedAddress.city}, {savedAddress.state} {savedAddress.postalCode}</p>
                <p>{savedAddress.phone}</p>
              </div>
            )}
          </div>

          {/* Step 2: Delivery Selection */}
          <div className={`card-surface mt-4 overflow-hidden transition-all duration-300 ${step !== 2 ? "opacity-60" : ""}`}>
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] p-5">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step >= 2 ? "bg-[#2563EB] text-white" : "bg-[#F1F5F9] text-[#94A3B8]"}`}>2</span>
              <h3 className="font-display font-semibold text-[#0F172A]">Delivery Options</h3>
            </div>

            {step === 2 && (
              <div className="space-y-3 p-5">
                {[
                  { id: "standard", label: "Standard Delivery", sub: "3–5 business days", price: "FREE" },
                  { id: "express",  label: "Express Delivery",  sub: "1–2 business days",  price: "₹99" },
                ].map((opt) => (
                  <label key={opt.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition ${deliveryType === opt.id ? "border-[#2563EB] bg-[#2563EB0D]" : "border-[#E2E8F0]"}`}>
                    <input type="radio" name="delivery" value={opt.id} checked={deliveryType === opt.id} onChange={() => setDT(opt.id)} className="accent-[#2563EB]" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#0F172A]">{opt.label}</p>
                      <p className="text-xs text-[#64748B]">{opt.sub}</p>
                    </div>
                    <span className={`text-sm font-bold ${opt.id === "standard" && shipping === 0 ? "text-[#22C55E]" : "text-[#0F172A]"}`}>
                      {opt.id === "standard" && shipping === 0 ? "FREE" : opt.price}
                    </span>
                  </label>
                ))}
                <button onClick={() => setStep(3)} className="btn-primary mt-2 w-full">
                  Continue to Payment <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Step 3: Payment Method */}
          <div className={`card-surface mt-4 overflow-hidden transition-all duration-300 ${step !== 3 ? "opacity-60" : ""}`}>
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] p-5">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step >= 3 ? "bg-[#2563EB] text-white" : "bg-[#F1F5F9] text-[#94A3B8]"}`}>3</span>
              <h3 className="font-display font-semibold text-[#0F172A]">Payment Method</h3>
            </div>

            {step === 3 && (
              <div className="space-y-3 p-5">
                {[
                  { id: "COD",      icon: Wallet,     label: "Cash on Delivery", sub: "Pay when your order arrives" },
                  { id: "RAZORPAY", icon: CreditCard, label: "Online Payment",   sub: "Cards, UPI, Net Banking via Razorpay" },
                ].map((opt) => (
                  <label key={opt.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition ${paymentMethod === opt.id ? "border-[#2563EB] bg-[#2563EB0D]" : "border-[#E2E8F0]"}`}>
                    <input type="radio" name="payment" value={opt.id} checked={paymentMethod === opt.id} onChange={() => setPM(opt.id)} className="accent-[#2563EB]" />
                    <opt.icon size={20} className="text-[#2563EB]" />
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">{opt.label}</p>
                      <p className="text-xs text-[#64748B]">{opt.sub}</p>
                    </div>
                  </label>
                ))}
                <button onClick={() => setStep(4)} className="btn-primary mt-2 w-full">
                  Review Order <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Step 4: Review Loop */}
          <div className={`card-surface mt-4 overflow-hidden transition-all duration-300 ${step !== 4 ? "opacity-60" : ""}`}>
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] p-5">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step >= 4 ? "bg-[#2563EB] text-white" : "bg-[#F1F5F9] text-[#94A3B8]"}`}>4</span>
              <h3 className="font-display font-semibold text-[#0F172A]">Review Order</h3>
            </div>

            {step === 4 && (
              <div className="p-5">
                <div className="mb-4 space-y-3">
                  {checkoutItems.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <img src={item.product?.images?.[0]?.url} alt="" className="h-14 w-14 rounded-xl object-cover" />
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-[#0F172A]">{item.product?.name}</p>
                        <p className="text-xs text-[#64748B]">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-[#0F172A]">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <button onClick={placeOrder} disabled={placing} className="btn-primary w-full !py-3 text-base">
                  {placing ? "Placing Order…" : `Place Order · ${formatPrice(total)}`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sticky Sidebar */}
        <div className="card-surface h-fit p-5">
          <h3 className="mb-4 font-display font-semibold text-[#0F172A]">Order Summary</h3>
          <div className="space-y-3">
            {checkoutItems.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                <img src={item.product?.images?.[0]?.url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-[#0F172A]">{item.product?.name}</p>
                  <p className="text-xs text-[#64748B]">Qty: {item.quantity}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2 border-t border-[#E2E8F0] pt-4 text-sm">
            <div className="flex justify-between text-[#64748B]"><span>Items ({checkoutItems.length})</span><span>{formatPrice(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-[#22C55E]"><span>Discount</span><span>–{formatPrice(discount)}</span></div>}
            <div className="flex justify-between text-[#64748B]">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span className="text-[#22C55E]">FREE</span> : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-[#E2E8F0] pt-3 font-display text-base font-bold text-[#0F172A]">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;