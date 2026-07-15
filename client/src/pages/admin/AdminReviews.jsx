import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Trash2, Star as StarIcon, Search, MessageSquare } from "lucide-react";
import Loader from "../../components/common/Loader";
import Rating from "../../components/common/Rating";
import EmptyState from "../../components/common/EmptyState";
import { adminService } from "../../services";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all");

  const load = () => { setLoading(true); adminService.reviews().then((r) => setReviews(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!confirm("Delete this review?")) return;
    await adminService.deleteReview(id);
    toast.success("Review deleted");
    load();
  };

  const filtered = reviews.filter((r) => {
    const matchSearch = !search || r.product?.name?.toLowerCase().includes(search.toLowerCase()) || r.user?.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "verified" && r.isVerifiedPurchase) || (filter === "low" && r.rating <= 2);
    return matchSearch && matchFilter;
  });

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0.0";

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">Reviews</h1>
          <p className="text-sm text-[#64748B]">{reviews.length} reviews · avg {avgRating}★</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product or user…" className="input-field !w-52 !py-2 pl-9 text-sm" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field !w-auto !py-2 text-sm">
            <option value="all">All Reviews</option>
            <option value="verified">Verified Only</option>
            <option value="low">Low Rating (≤2★)</option>
          </select>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label:"Total Reviews", value: reviews.length, color:"#2563EB" },
          { label:"Avg Rating",    value: `${avgRating}★`, color:"#FACC15" },
          { label:"Verified",      value: reviews.filter((r) => r.isVerifiedPurchase).length, color:"#22C55E" },
          { label:"Low Rated",     value: reviews.filter((r) => r.rating <= 2).length,        color:"#EF4444" },
        ].map((s) => (
          <div key={s.label} className="card-surface p-4">
            <p className="font-display text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-[#64748B]">{s.label}</p>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No reviews found" description="Reviews from customers will appear here." />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r._id} className="card-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#4F46E5] font-bold text-white text-sm">
                    {r.user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[#0F172A]">{r.user?.name}</p>
                      {r.isVerifiedPurchase && (
                        <span className="rounded-full bg-[#22C55E1A] px-2 py-0.5 text-[10px] font-semibold text-[#22C55E]">✓ Verified Purchase</span>
                      )}
                    </div>
                    <p className="text-xs text-[#94A3B8]">{r.user?.email}</p>
                    <Rating value={r.rating} size={13} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-[#94A3B8]">
                    <p>Product: <span className="font-medium text-[#64748B]">{r.product?.name}</span></p>
                    <p>{new Date(r.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</p>
                  </div>
                  <button onClick={() => del(r._id)} className="rounded-lg p-2 text-[#EF4444] hover:bg-[#EF44441A]"><Trash2 size={15}/></button>
                </div>
              </div>
              {r.title && <p className="mt-2 font-semibold text-[#0F172A]">{r.title}</p>}
              <p className="mt-1 text-sm text-[#64748B]">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
