import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Circle, Printer, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "../../components/common/Loader";
import OrderStatusBadge from "../../components/common/OrderStatusBadge";
import { orderService } from "../../services";

const fmtPrice = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;
const steps    = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered"];

const OrderDetails = () => {
  const { id }           = useParams();
  const [order, setOrder]= useState(null);
  const [loading, setL]  = useState(true);

  const load = () => orderService.getOne(id).then((r) => setOrder(r.data)).finally(() => setL(false));
  useEffect(() => { load(); }, [id]);

  const handleCancel = async () => {
    if (!confirm("Cancel this order?")) return;
    try {
      await orderService.cancel(id);
      toast.success("Order cancelled");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot cancel");
    }
  };

  if (loading || !order) return <Loader fullScreen />;

  const stepIdx    = steps.indexOf(order.status);
  const isCancelled= order.status === "Cancelled";

  return (
    <div className="section-container py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/orders" className="mb-2 flex items-center gap-1 text-sm text-[#2563EB]"><ArrowLeft size={15}/> My Orders</Link>
          <h1 className="font-display text-xl font-bold text-[#0F172A]">Order #{order.orderNumber}</h1>
          <p className="text-sm text-[#64748B]">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {day:"numeric",month:"long",year:"numeric"})}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <button onClick={() => window.print()} className="btn-secondary !py-2 text-sm"><Printer size={14}/> Invoice</button>
          {!isCancelled && !["Shipped","Delivered"].includes(order.status) && (
            <button onClick={handleCancel} className="rounded-2xl border border-[#EF4444] px-4 py-2 text-sm font-semibold text-[#EF4444] hover:bg-[#FEF2F2]">Cancel</button>
          )}
        </div>
      </div>

      {/* Tracking stepper */}
      {!isCancelled ? (
        <div className="card-surface mb-6 p-6">
          <div className="flex items-start justify-between overflow-x-auto">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <div className={`h-0.5 flex-1 ${i === 0 ? "invisible" : i <= stepIdx ? "bg-[#2563EB]" : "bg-[#E2E8F0]"}`} />
                  <div className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition ${i <= stepIdx ? "border-[#2563EB] bg-[#2563EB] text-white" : "border-[#E2E8F0] bg-white text-[#94A3B8]"}`}>
                    {i < stepIdx ? <CheckCircle2 size={18}/> : <Circle size={16}/>}
                  </div>
                  <div className={`h-0.5 flex-1 ${i === steps.length - 1 ? "invisible" : i < stepIdx ? "bg-[#2563EB]" : "bg-[#E2E8F0]"}`} />
                </div>
                <p className={`mt-2 text-xs font-semibold ${i <= stepIdx ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>{s}</p>
                {order.statusHistory?.find((h) => h.status === s) && (
                  <p className="mt-0.5 text-[10px] text-[#94A3B8]">
                    {new Date(order.statusHistory.find((h) => h.status === s).changedAt).toLocaleDateString("en-IN")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card-surface mb-6 p-5 text-center">
          <p className="font-semibold text-[#EF4444]">This order has been cancelled.</p>
          {order.cancelledAt && <p className="text-sm text-[#94A3B8]">on {new Date(order.cancelledAt).toLocaleDateString("en-IN")}</p>}
        </div>
      )}

      {/* Body */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Items */}
        <div className="card-surface p-5">
          <h3 className="mb-4 font-display font-semibold text-[#0F172A]">Order Items</h3>
          <div className="space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover bg-[#F8FAFC]" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0F172A]">{item.name}</p>
                  <p className="text-xs text-[#64748B]">Qty: {item.quantity} × {fmtPrice(item.price)}</p>
                </div>
                <p className="font-semibold text-[#0F172A]">{fmtPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Shipping address */}
          <div className="card-surface p-5">
            <h3 className="mb-3 font-display font-semibold text-[#0F172A]">Shipping Address</h3>
            <p className="text-sm font-semibold text-[#0F172A]">{order.shippingAddress.fullName}</p>
            <p className="mt-1 text-sm text-[#64748B]">
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.country}
            </p>
            <p className="mt-1 text-sm text-[#64748B]">📞 {order.shippingAddress.phone}</p>
          </div>

          {/* Price summary */}
          <div className="card-surface space-y-2.5 p-5 text-sm">
            <h3 className="font-display font-semibold text-[#0F172A]">Price Summary</h3>
            <div className="flex justify-between text-[#64748B]"><span>Items ({order.items.length})</span><span>{fmtPrice(order.itemsPrice)}</span></div>
            {order.discountAmount > 0 && <div className="flex justify-between text-[#22C55E]"><span>Discount</span><span>–{fmtPrice(order.discountAmount)}</span></div>}
            <div className="flex justify-between text-[#64748B]"><span>Shipping</span><span>{order.shippingPrice === 0 ? <span className="text-[#22C55E]">FREE</span> : fmtPrice(order.shippingPrice)}</span></div>
            <div className="flex justify-between border-t border-[#E2E8F0] pt-2 font-display text-base font-bold text-[#0F172A]"><span>Total</span><span>{fmtPrice(order.totalPrice)}</span></div>
            <p className="text-xs text-[#94A3B8]">Payment: {order.paymentMethod === "COD" ? "Cash on Delivery" : "Online (Razorpay)"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
