import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Search, Eye } from "lucide-react";
import Loader from "../../components/common/Loader";
import OrderStatusBadge from "../../components/common/OrderStatusBadge";
import EmptyState from "../../components/common/EmptyState";
import { adminService } from "../../services";

const STATUSES = ["Pending","Confirmed","Packed","Shipped","Delivered","Cancelled"];
const fmtPrice = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const AdminOrders = () => {
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page,         setPage]         = useState(1);
  const [total,        setTotal]        = useState(0);
  const LIMIT = 15;

  const load = useCallback(() => {
    setLoading(true);
    adminService.orders({ search: search || undefined, status: statusFilter || undefined, page, limit: LIMIT })
      .then((r) => { setOrders(r.data); setTotal(r.pagination?.total || 0); })
      .finally(() => setLoading(false));
  }, [search, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id, status) => {
    try {
      await adminService.updateOrderStatus(id, status);
      toast.success("Status updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update status");
    }
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">Orders</h1>
          <p className="text-sm text-[#64748B]">{total} total orders</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"/>
            <input
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search order #…"
              className="input-field !w-48 !py-2 pl-9 text-sm"
            />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field !w-auto !py-2 text-sm">
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Status summary pills */}
      <div className="mb-5 flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          return (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${statusFilter === s ? "bg-[#0F172A] text-white" : "bg-white border border-[#E2E8F0] text-[#64748B]"}`}>
              {s} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {loading ? <Loader fullScreen/> : orders.length === 0 ? (
        <EmptyState title="No orders found" description="Try adjusting your search or filter."/>
      ) : (
        <>
          <div className="card-surface overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-[#0F172A]">#{o.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#0F172A]">{o.user?.name}</p>
                      <p className="text-xs text-[#94A3B8]">{o.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 text-[#64748B]">{o.items?.length || 0}</td>
                    <td className="px-4 py-3 font-semibold text-[#0F172A]">{fmtPrice(o.totalPrice)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${o.paymentMethod === "COD" ? "bg-[#F973161A] text-[#F97316]" : "bg-[#22C55E1A] text-[#22C55E]"}`}>
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select value={o.status} onChange={(e) => handleStatusChange(o._id, e.target.value)}
                        className="rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-xs font-semibold text-[#0F172A] focus:border-[#2563EB] focus:outline-none">
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/orders/${o._id}`} target="_blank"
                        className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] px-2 py-1 text-xs hover:border-[#2563EB] hover:text-[#2563EB]">
                        <Eye size={13}/> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-5 flex justify-center gap-1">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`h-9 w-9 rounded-xl text-sm font-semibold ${p === page ? "bg-[#2563EB] text-white" : "border border-[#E2E8F0] bg-white text-[#64748B]"}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminOrders;
