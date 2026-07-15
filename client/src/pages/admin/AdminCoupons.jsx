import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, X, Ticket, Copy } from "lucide-react";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { adminService } from "../../services";

const empty = { code:"", description:"", discountType:"PERCENTAGE", discountValue:"", minOrderValue:"", maxDiscountAmount:"", usageLimit:"", expiresAt:"", isActive:true };
const fmtPrice = (v) => `₹${Number(v||0).toLocaleString("en-IN")}`;

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(empty);
  const [saving,  setSaving]  = useState(false);

  const load = () => { setLoading(true); adminService.coupons().then((r) => setCoupons(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.createCoupon({
        ...form,
        discountValue:    Number(form.discountValue),
        minOrderValue:    Number(form.minOrderValue)    || 0,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        usageLimit:       form.usageLimit        ? Number(form.usageLimit)        : null,
      });
      toast.success("Coupon created ✓");
      setModal(false); setForm(empty); load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create coupon");
    } finally { setSaving(false); }
  };

  const deleteCoupon = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    await adminService.deleteCoupon(id);
    toast.success("Coupon deleted");
    load();
  };

  const copy = (code) => { navigator.clipboard?.writeText(code); toast.success(`"${code}" copied!`); };

  const isExpired = (d) => new Date(d) < new Date();

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">Coupons</h1>
          <p className="text-sm text-[#64748B]">{coupons.length} coupons</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary !py-2 text-sm"><Plus size={16}/> Create Coupon</button>
      </div>

      {coupons.length === 0 ? (
        <EmptyState icon={Ticket} title="No coupons yet" description="Create discount coupons for your customers." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((c) => {
            const expired = isExpired(c.expiresAt);
            return (
              <div key={c._id} className={`card-surface overflow-hidden ${expired ? "opacity-60" : ""}`}>
                <div className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display text-xl font-bold tracking-widest text-white">{c.code}</p>
                      <p className="text-xs text-white/70">{c.description || "No description"}</p>
                    </div>
                    <button onClick={() => copy(c.code)} className="rounded-lg bg-white/20 p-2 text-white hover:bg-white/30">
                      <Copy size={14}/>
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-xl bg-[#F8FAFC] p-2 text-center">
                      <p className="font-bold text-[#2563EB]">{c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : fmtPrice(c.discountValue)}</p>
                      <p className="text-xs text-[#64748B]">Discount</p>
                    </div>
                    <div className="rounded-xl bg-[#F8FAFC] p-2 text-center">
                      <p className="font-bold text-[#0F172A]">{fmtPrice(c.minOrderValue)}</p>
                      <p className="text-xs text-[#64748B]">Min order</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-[#64748B]">
                    <div className="flex justify-between">
                      <span>Usage</span>
                      <span className="font-medium text-[#0F172A]">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : " (unlimited)"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expires</span>
                      <span className={`font-medium ${expired ? "text-[#EF4444]" : "text-[#0F172A]"}`}>
                        {new Date(c.expiresAt).toLocaleDateString("en-IN")} {expired && "(Expired)"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.isActive && !expired ? "bg-[#22C55E1A] text-[#22C55E]" : "bg-[#EF44441A] text-[#EF4444]"}`}>
                      {expired ? "Expired" : c.isActive ? "Active" : "Inactive"}
                    </span>
                    <button onClick={() => deleteCoupon(c._id)} className="rounded-lg p-1.5 text-[#EF4444] hover:bg-[#EF44441A]"><Trash2 size={15}/></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-8">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-[#0F172A]">Create Coupon</h3>
              <button onClick={() => setModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#0F172A]">Coupon Code *</label>
                <input required placeholder="WELCOME10" value={form.code}
                  onChange={(e) => setForm({...form, code:e.target.value.toUpperCase()})} className="input-field font-mono font-bold" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#0F172A]">Description</label>
                <input placeholder="10% off for new users" value={form.description} onChange={(e) => setForm({...form, description:e.target.value})} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Type *</label>
                  <select value={form.discountType} onChange={(e) => setForm({...form, discountType:e.target.value})} className="input-field">
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Value *</label>
                  <input required type="number" min="1" placeholder={form.discountType === "PERCENTAGE" ? "10" : "200"}
                    value={form.discountValue} onChange={(e) => setForm({...form, discountValue:e.target.value})} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Min Order (₹)</label>
                  <input type="number" min="0" placeholder="500" value={form.minOrderValue} onChange={(e) => setForm({...form, minOrderValue:e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Max Discount (₹)</label>
                  <input type="number" min="0" placeholder="optional" value={form.maxDiscountAmount} onChange={(e) => setForm({...form, maxDiscountAmount:e.target.value})} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Usage Limit</label>
                  <input type="number" min="1" placeholder="optional" value={form.usageLimit} onChange={(e) => setForm({...form, usageLimit:e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Expiry Date *</label>
                  <input required type="date" value={form.expiresAt} onChange={(e) => setForm({...form, expiresAt:e.target.value})} className="input-field" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-[#64748B]">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive:e.target.checked})} className="accent-[#2563EB]" />
                Active (visible to customers)
              </label>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Saving…" : "Create Coupon"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
