import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Package } from "lucide-react";
import Loader from "../../components/common/Loader";
import ImageUploader from "../../components/ui/ImageUploader";
import EmptyState from "../../components/common/EmptyState";
import { productService, categoryService } from "../../services";

const emptyForm = {
  name: "", description: "", brand: "", category: "",
  price: "", discountPrice: "", stock: "",
  isFeatured: false, isFlashDeal: false, isActive: true,
  imageUrl: "",
};

const formatPrice = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const AdminProducts = () => {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [form,       setForm]       = useState(emptyForm);
  const [saving,     setSaving]     = useState(false);
  const [search,     setSearch]     = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([productService.list({ limit: 100 }), categoryService.list()])
      .then(([p, c]) => { setProducts(p.data); setCategories(c.data); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit   = (p) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, brand: p.brand,
      category: p.category?._id || p.category,
      price: p.price, discountPrice: p.discountPrice || "",
      stock: p.stock, isFeatured: p.isFeatured,
      isFlashDeal: p.isFlashDeal, isActive: p.isActive,
      imageUrl: p.images?.[0]?.url || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) { toast.error("Please select a category"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name, description: form.description, brand: form.brand,
        category: form.category,
        price: Number(form.price), discountPrice: Number(form.discountPrice) || 0,
        stock: Number(form.stock),
        isFeatured: form.isFeatured, isFlashDeal: form.isFlashDeal, isActive: form.isActive,
        images: form.imageUrl ? [{ url: form.imageUrl }] : [],
      };
      if (editing) { await productService.update(editing._id, payload); toast.success("Product updated"); }
      else         { await productService.create(payload);              toast.success("Product created"); }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save product");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await productService.remove(id);
    toast.success("Product deleted");
    load();
  };

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">Products</h1>
          <p className="text-sm text-[#64748B]">{products.length} total products</p>
        </div>
        <div className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="input-field !w-52 !py-2 text-sm" />
          <button onClick={openCreate} className="btn-primary !py-2 text-sm">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="No products yet" description="Add your first product to get started." actionLabel="Add Product" actionTo="#" />
      ) : (
        <div className="card-surface overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-left text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Flags</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0]?.url
                        ? <img src={p.images[0].url} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                        : <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F1F5F9]"><Package size={16} className="text-[#94A3B8]" /></div>}
                      <div>
                        <p className="font-medium text-[#0F172A]">{p.name}</p>
                        <p className="text-xs text-[#94A3B8]">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#64748B]">{p.category?.name}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#0F172A]">{formatPrice(p.discountPrice || p.price)}</p>
                    {p.discountPrice > 0 && <p className="text-xs text-[#94A3B8] line-through">{formatPrice(p.price)}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${p.stock < 10 ? "text-[#EF4444]" : "text-[#22C55E]"}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {p.isFeatured  && <span className="rounded-full bg-[#4F46E51A] px-2 py-0.5 text-[10px] font-semibold text-[#4F46E5]">Featured</span>}
                      {p.isFlashDeal && <span className="rounded-full bg-[#F973161A] px-2 py-0.5 text-[10px] font-semibold text-[#F97316]">Flash</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.isActive ? "bg-[#22C55E1A] text-[#22C55E]" : "bg-[#EF44441A] text-[#EF4444]"}`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(p)} className="mr-3 rounded-lg p-1.5 text-[#2563EB] hover:bg-[#2563EB1A]"><Pencil size={15} /></button>
                    <button onClick={() => handleDelete(p._id)} className="rounded-lg p-1.5 text-[#EF4444] hover:bg-[#EF44441A]"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-8">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-[#0F172A]">{editing ? "Edit Product" : "Add New Product"}</h3>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F8FAFC]"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Product Name *</label>
                  <input required placeholder="e.g. iPhone 15 128GB" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Description *</label>
                  <textarea required rows={3} placeholder="Product description…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Brand *</label>
                  <input required placeholder="Apple" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Category *</label>
                  <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">MRP Price (₹) *</label>
                  <input required type="number" min="0" placeholder="69990" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Selling Price (₹)</label>
                  <input type="number" min="0" placeholder="59990" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#0F172A]">Stock *</label>
                  <input required type="number" min="0" placeholder="100" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" />
                </div>
                <div className="flex flex-col justify-end gap-2">
                  <label className="flex items-center gap-2 text-sm text-[#64748B]">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="accent-[#2563EB]" /> Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#64748B]">
                    <input type="checkbox" checked={form.isFlashDeal} onChange={(e) => setForm({ ...form, isFlashDeal: e.target.checked })} className="accent-[#2563EB]" /> Flash Deal
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#64748B]">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-[#2563EB]" /> Active
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <ImageUploader
                    label="Product Image"
                    value={form.imageUrl}
                    onChange={(url) => setForm({ ...form, imageUrl: url })}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Saving…" : editing ? "Update Product" : "Create Product"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
