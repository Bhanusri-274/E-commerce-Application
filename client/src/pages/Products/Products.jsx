import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, Search, ChevronDown, ChevronUp } from "lucide-react";
import ProductCard from "../../components/common/ProductCard";
import { ProductGridSkeleton } from "../../components/common/Skeletons";
import EmptyState from "../../components/common/EmptyState";
import Breadcrumb from "../../components/common/Breadcrumb";
import Pagination from "../../components/ui/Pagination";
import { productService, categoryService } from "../../services";

const sortOptions = [
  { value: "newest",      label: "Popularity" },
  { value: "price_asc",   label: "Price: Low to High" },
  { value: "price_desc",  label: "Price: High to Low" },
  { value: "rating",      label: "Top Rated" },
  { value: "bestselling", label: "Best Selling" },
  { value: "newest",      label: "Newest First" },
];

const ratingOptions = [
  { value: "4", label: "4★ & above" },
  { value: "3", label: "3★ & above" },
  { value: "2", label: "2★ & above" },
  { value: "1", label: "1★ & above" },
];

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#E2E8F0] pb-4">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between py-3 text-sm font-semibold text-[#0F172A]">
        {title}
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");

  const keyword   = searchParams.get("keyword") || "";
  const category  = searchParams.get("category") || "";
  const brand     = searchParams.get("brand") || "";
  const minPrice  = searchParams.get("minPrice") || "";
  const maxPrice  = searchParams.get("maxPrice") || "";
  const rating    = searchParams.get("rating") || "";
  const sort      = searchParams.get("sort") || "newest";
  const page      = Number(searchParams.get("page") || 1);
  const flashDeal = searchParams.get("flashDeal") || "";

  useEffect(() => {
    categoryService.list().then((r) => setCategories(r.data)).catch(() => {});
    // Extract unique brands from products
    productService.list({ limit: 100 }).then((r) => {
      const uniqueBrands = [...new Set(r.data.map((p) => p.brand).filter(Boolean))].sort();
      setBrands(uniqueBrands);
    }).catch(() => {});
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    productService.list({
      keyword: keyword || undefined,
      category: category || undefined,
      brand: brand || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      rating: rating || undefined,
      sort,
      page,
      flashDeal: flashDeal || undefined,
      limit: 12,
    }).then((res) => {
      setProducts(res.data);
      setPagination(res.pagination);
    }).finally(() => setLoading(false));
  }, [keyword, category, brand, minPrice, maxPrice, rating, sort, page, flashDeal]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    value ? next.set(key, value) : next.delete(key);
    next.delete("page");
    setSearchParams(next);
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (keyword) next.set("keyword", keyword);
    setSearchParams(next);
  };

  const hasFilters = category || brand || minPrice || maxPrice || rating;

  const filteredBrands = brands.filter((b) => b.toLowerCase().includes(brandSearch.toLowerCase()));

  const FiltersPanel = (
    <div className="space-y-1">
      {hasFilters && (
        <button onClick={clearFilters} className="flex w-full items-center justify-between rounded-xl bg-[#EF44441A] px-3 py-2 text-xs font-semibold text-[#EF4444]">
          Clear All Filters <X size={13} />
        </button>
      )}

      <FilterSection title="Category">
        <label className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A]">
          <input type="radio" name="cat" checked={!category} onChange={() => setParam("category", "")} className="accent-[#2563EB]" />
          All
        </label>
        {categories.map((c) => (
          <label key={c._id} className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A]">
            <input type="radio" name="cat" checked={category === c._id} onChange={() => setParam("category", c._id)} className="accent-[#2563EB]" />
            {c.name}
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Brand" defaultOpen={true}>
        <div className="relative mb-2">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            placeholder="Search Brand"
            className="input-field !py-1.5 pl-8 text-xs"
          />
        </div>
        {filteredBrands.slice(0, 8).map((b) => (
          <label key={b} className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A]">
            <input type="checkbox" checked={brand.split(",").includes(b)} onChange={(e) => {
              const curr = brand ? brand.split(",") : [];
              const next = e.target.checked ? [...curr, b] : curr.filter((x) => x !== b);
              setParam("brand", next.join(","));
            }} className="accent-[#2563EB]" />
            {b}
          </label>
        ))}
        {filteredBrands.length > 8 && (
          <button className="text-xs font-semibold text-[#2563EB]">+ View More</button>
        )}
      </FilterSection>

      <FilterSection title="Price">
        <div className="flex items-center gap-2 pt-1">
          <input
            type="number"
            placeholder="₹500"
            defaultValue={minPrice}
            onBlur={(e) => setParam("minPrice", e.target.value)}
            className="input-field !py-2 text-xs"
          />
          <span className="shrink-0 text-[#94A3B8]">to</span>
          <input
            type="number"
            placeholder="₹80,000"
            defaultValue={maxPrice}
            onBlur={(e) => setParam("maxPrice", e.target.value)}
            className="input-field !py-2 text-xs"
          />
        </div>
      </FilterSection>

      <FilterSection title="Rating">
        {ratingOptions.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 text-sm text-[#64748B] hover:text-[#0F172A]">
            <input type="radio" name="rating" checked={rating === opt.value} onChange={() => setParam("rating", opt.value)} className="accent-[#2563EB]" />
            {opt.label}
          </label>
        ))}
      </FilterSection>
    </div>
  );

  const categoryName = categories.find((c) => c._id === category)?.name;

  return (
    <div className="section-container py-6">
      <Breadcrumb items={[
        { to: "/", label: "Home" },
        ...(categoryName ? [{ label: categoryName }] : [{ label: keyword ? `Results: "${keyword}"` : "All Products" }]),
      ]} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <div className="card-surface sticky top-24 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display font-semibold text-[#0F172A]">Filters</h3>
              {hasFilters && <button onClick={clearFilters} className="text-xs font-semibold text-[#EF4444]">Clear All</button>}
            </div>
            {FiltersPanel}
          </div>
        </aside>

        {/* Mobile filter drawer */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
            <div className="relative ml-auto h-full w-80 overflow-y-auto bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display font-semibold">Filters</h3>
                <button onClick={() => setFiltersOpen(false)}><X size={20} /></button>
              </div>
              {FiltersPanel}
            </div>
          </div>
        )}

        {/* Products area */}
        <div>
          {/* Header */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#64748B]">
              Showing <span className="font-semibold text-[#0F172A]">1-{Math.min(12, pagination.total)}</span> of{" "}
              <span className="font-semibold text-[#0F172A]">{pagination.total}</span> products
            </p>
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-[#64748B] sm:block">Sort by:</span>
              <select value={sort} onChange={(e) => setParam("sort", e.target.value)} className="input-field !w-auto !py-2 text-sm">
                {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button onClick={() => setFiltersOpen(true)} className="btn-secondary !py-2 text-sm lg:hidden">
                <SlidersHorizontal size={14} /> Filters
              </button>
            </div>
          </div>

          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : products.length === 0 ? (
            <EmptyState title="No products found" description="Try adjusting your filters or search term." />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              <div className="mt-8">
                <Pagination
                  page={pagination.page}
                  pages={pagination.pages}
                  onChange={(p) => setParam("page", String(p))}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
