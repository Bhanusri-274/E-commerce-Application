import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, X, ToggleLeft, ToggleRight } from "lucide-react";
import Loader from "../../components/common/Loader";
import ImageUploader from "../../components/ui/ImageUploader";
import { adminService } from "../../services";

const emptyForm = { title: "", subtitle: "", link: "", position: "HERO", order: 0, imageUrl: "" };

const AdminBanners = () => {
  const [banners,   setBanners]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form,      setForm]      = useState(emptyForm);
  const [saving,    setSaving]    = useState(false);

  const load = () => {
    setLoading(true);
    adminService.banners().then((r) => setBanners(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.imageUrl) { toast.error("Please add a banner image"); return; }
    setSaving(true);
    try {
      await adminService.createBanner({
        title: form.title, subtitle: form.subtitle, link: form.link,
        position: form.position, order: Number(form.order) || 0,
        image: { url: form.imageUrl },
      });
      toast.success("Banner created");
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create banner");
    } finally { setSaving(false); }
  };

  const handleToggle = async (b) => {
    await adminService.updateBanner(b._id, { isActive: !b.isActive });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this banner?")) return;
    await adminService.deleteBanner(id);
    toast.success("Banner deleted");
    load();
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">Banners</h1>
          <p className="text-sm text-[#64748B]">{banners.length} banners</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary !py-2 text-sm">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {banners.map((b) => (
          <div key={b._id} className="card-surface overflow-hidden">
            <div className="relative h-40">
              <img src={b.image?.url} alt={b.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <p className="font-display font-bold">{b.title}</p>
                {b.subtitle && <p className="text-xs text-white/80">{b.subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#2563EB1A] px-2 py-0.5 text-xs font-semibold text-[#2563EB]">{b.position}</span>
                <span className="text-xs text-[#64748B]">Order: {b.order}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${b.isActive ? "bg-[#22C55E1A] text-[#22C55E]" : "bg-[#EF44441A] text-[#EF4444]"}`}>
                  {b.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleToggle(b)} className="text-[#64748B] hover:text-[#2563EB]">
                  {b.isActive ? <ToggleRight size={20} className="text-[#22C55E]" /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => handleDelete(b._id)} className="text-[#EF4444]"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-8">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-[#0F172A]">Add Banner</h3>
              <button onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Banner title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
              <input placeholder="Subtitle (optional)" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input-field" />
              <input placeholder="Link (e.g. /products)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="input-field" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#64748B]">Position</label>
                  <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="input-field">
                    <option value="HERO">Hero</option>
                    <option value="PROMO">Promo</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#64748B]">Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="input-field" />
                </div>
              </div>
              <ImageUploader
                label="Banner Image"
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
              />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Saving…" : "Create Banner"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
