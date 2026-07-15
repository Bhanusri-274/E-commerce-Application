import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, FolderTree } from "lucide-react";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { categoryService } from "../../services";

const ICONS = ["📱","👗","🏠","💄","⚽","📚","🎮","🎵","🍔","🚗","✈️","🎨"];
const emptyForm = { name:"", description:"", isActive:true };

const AdminCategories = () => {
  const [categories, setCats]     = useState([]);
  const [loading,    setLoading]  = useState(true);
  const [modal,      setModal]    = useState(false);
  const [editing,    setEditing]  = useState(null);
  const [form,       setForm]     = useState(emptyForm);
  const [saving,     setSaving]   = useState(false);

  const load = () => {
    setLoading(true);
    categoryService.list().then((r) => setCats(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit   = (c)  => { setEditing(c); setForm({ name:c.name, description:c.description||"", isActive:c.isActive }); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await categoryService.update(editing._id, form); toast.success("Category updated"); }
      else         { await categoryService.create(form);              toast.success("Category created"); }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save category");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category? Products in it won't be deleted.")) return;
    await categoryService.remove(id);
    toast.success("Category deleted");
    load();
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">Categories</h1>
          <p className="text-sm text-[#64748B]">{categories.length} categories</p>
        </div>
        <button onClick={openCreate} className="btn-primary !py-2 text-sm"><Plus size={16}/> Add Category</button>
      </div>

      {categories.length === 0 ? (
        <EmptyState icon={FolderTree} title="No categories yet" description="Create your first product category." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <div key={c._id} className="card-surface flex items-start justify-between p-5 hover:-translate-y-0.5">
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F8FAFC] text-2xl">
                  {ICONS[i % ICONS.length]}
                </span>
                <div>
                  <p className="font-display font-semibold text-[#0F172A]">{c.name}</p>
                  <p className="mt-0.5 text-xs text-[#64748B] line-clamp-1">{c.description || "No description"}</p>
                  <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.isActive ? "bg-[#22C55E1A] text-[#22C55E]" : "bg-[#EF44441A] text-[#EF4444]"}`}>
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(c)} className="rounded-lg p-2 text-[#2563EB] hover:bg-[#2563EB1A]"><Pencil size={15}/></button>
                <button onClick={() => handleDelete(c._id)} className="rounded-lg p-2 text-[#EF4444] hover:bg-[#EF44441A]"><Trash2 size={15}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-[#0F172A]">{editing ? "Edit Category" : "Add Category"}</h3>
              <button onClick={() => setModal(false)} className="rounded-lg p-1.5 hover:bg-[#F8FAFC]"><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#0F172A]">Category Name *</label>
                <input required placeholder="e.g. Electronics" value={form.name} onChange={(e) => setForm({...form, name:e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#0F172A]">Description</label>
                <textarea rows={3} placeholder="Short description of the category" value={form.description} onChange={(e) => setForm({...form, description:e.target.value})} className="input-field" />
              </div>
              <label className="flex items-center gap-2 text-sm text-[#64748B]">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive:e.target.checked})} className="accent-[#2563EB]" />
                Active (visible on store)
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Saving…" : editing ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
