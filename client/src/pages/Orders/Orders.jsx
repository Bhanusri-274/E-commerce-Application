import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ChevronRight } from "lucide-react";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import OrderStatusBadge from "../../components/common/OrderStatusBadge";
import { orderService } from "../../services";

const formatPrice = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const Orders = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState("all");

  useEffect(() => {
    orderService.myOrders().then((r) => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = tab === "all" ? orders : orders.filter((o) => {
    if (tab === "active")    return ["Pending","Confirmed","Packed","Shipped"].includes(o.status);
    if (tab === "delivered") return o.status === "Delivered";
    if (tab === "cancelled") return o.status === "Cancelled";
    return true;
  });

  if (loading) return <Loader fullScreen />;

  return (
    <div className="section-container py-8">
      <h1 className="font-display text-2xl font-bold text-[#0F172A]">My Orders</h1>
      <p className="mt-1 text-sm text-[#64748B]">{orders.length} orders placed</p>

      {/* Tabs */}
      <div className="mt-5 flex gap-1 overflow-x-auto border-b border-[#E2E8F0]">
        {[
          { id: "all",       label: "All Orders" },
          { id: "active",    label: "Active" },
          { id: "delivered", label: "Delivered" },
          { id: "cancelled", label: "Cancelled" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 border-b-2 px-5 py-3 text-sm font-semibold transition ${tab === t.id ? "border-[#2563EB] text-[#2563EB]" : "border-transparent text-[#64748B]"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={Package} title="No orders here" description="When you place orders, they'll show up here." actionLabel="Start Shopping" actionTo="/products" />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filtered.map((o) => (
            <Link key={o._id} to={`/orders/${o._id}`}
              className="card-surface flex flex-wrap items-center justify-between gap-4 p-5 hover:-translate-y-0.5">
              {/* Items preview */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {o.items.slice(0, 3).map((item, i) => (
                    <img key={i} src={item.image} alt={item.name}
                      className="h-12 w-12 rounded-xl border-2 border-white object-cover shadow" />
                  ))}
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-[#0F172A]">#{o.orderNumber}</p>
                  <p className="text-xs text-[#64748B]">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
                    {" · "}{o.items.length} item{o.items.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <OrderStatusBadge status={o.status} />
                <p className="font-display font-bold text-[#0F172A]">{formatPrice(o.totalPrice)}</p>
                <ChevronRight size={18} className="text-[#94A3B8]" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
