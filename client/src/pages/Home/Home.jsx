import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Truck, ShieldCheck, RotateCcw, Headphones, Timer } from "lucide-react";
import HeroCarousel from "../../components/common/HeroCarousel";
import SectionHeading from "../../components/common/SectionHeading";
import ProductCard from "../../components/common/ProductCard";
import { ProductGridSkeleton } from "../../components/common/Skeletons";
import CountdownTimer from "../../components/common/CountdownTimer";
import { productService, categoryService, bannerService } from "../../services";

const perks = [
  { icon: Truck, title: "Free Delivery", desc: "On orders above ₹499" },
  { icon: RotateCcw, title: "Easy Returns", desc: "10 days return policy" },
  { icon: ShieldCheck, title: "Secure Payment", desc: "100% secure payments" },
  { icon: Headphones, title: "24/7 Support", desc: "We're here to help" },
];


const RECENTLY_KEY = "shopez_recently_viewed";

export const trackRecentlyViewed = (product) => {
  try {
    const existing = JSON.parse(localStorage.getItem(RECENTLY_KEY) || "[]");
    const filtered = existing.filter((p) => p._id !== product._id);
    const updated = [product, ...filtered].slice(0, 8);
    localStorage.setItem(RECENTLY_KEY, JSON.stringify(updated));
  } catch {}
};

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

// const CATEGORY_ICONS = ["📱", "👗", "🏠", "💄", "⚽", "📚", "🎮", "🎵"];

const Home = () => {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [trending, setTrending] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flashDealEnd] = useState(() => new Date(Date.now() + 2 * 3600000 + 45 * 60000 + 18000));


  useEffect(() => {
    const rv = JSON.parse(localStorage.getItem(RECENTLY_KEY) || "[]");
    setRecentlyViewed(rv);

    Promise.all([
      bannerService.list("HERO"),
      categoryService.list(),
      productService.list({ flashDeal: true, limit: 6 }),
      productService.list({ featured: true, limit: 8 }),
      productService.list({ sort: "bestselling", limit: 6 }),
      productService.list({ sort: "newest", limit: 8 }),
    ])
      .then(([b, c, fd, ft, bs, na]) => {
        setBanners(b.data);
        setCategories(c.data);
        setFlashDeals(fd.data);
        setTrending(ft.data);
        setBestSellers(bs.data);
        setNewArrivals(na.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-14 pb-16">
      <section id="home" className="scroll-mt-32">
      {/* Hero + Perks */}
      <div className="section-container space-y-5 pt-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
          <HeroCarousel banners={banners} />
          {/* Side perks */}
          <div className="hidden flex-col gap-4 lg:flex">
            {perks.map((p) => (
              <div key={p.title} className="card-surface flex items-center gap-3 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2563EB0D]">
                  <p.icon size={20} className="text-[#2563EB]" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">{p.title}</p>
                  <p className="text-xs text-[#64748B]">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile perks row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:hidden">
          {perks.map((p) => (
            <div key={p.title} className="card-surface flex items-center gap-2 p-3">
              <p.icon size={16} className="shrink-0 text-[#2563EB]" />
              <p className="text-xs font-medium text-[#0F172A]">{p.title}</p>
            </div>
          ))}
        </div>
      </div>
      </section>

      {/* Categories
      {categories.length > 0 && (
        <section className="section-container">
          <div className="mb-5 overflow-x-auto">
            <div className="flex min-w-max gap-4">
              {categories.map((c, i) => (
                <Link
                  key={c._id}
                  to={`/products?category=${c._id}`}
                  className="card-surface flex flex-col items-center gap-2 px-6 py-4 hover:-translate-y-1 hover:border-[#2563EB]"
                >
                  <span className="text-2xl">{CATEGORY_ICONS[i] || "🛍️"}</span>
                  <span className="text-xs font-semibold text-[#0F172A]">{c.name}</span>
                </Link>
              ))}
              <Link to="/products" className="card-surface flex flex-col items-center gap-2 px-6 py-4 hover:-translate-y-1">
                <span className="text-2xl">➕</span>
                <span className="text-xs font-semibold text-[#0F172A]">More</span>
              </Link>
            </div>
          </div>
        </section>
      )} */}

      {loading ? (
        <div className="section-container"><ProductGridSkeleton count={6} /></div>
      ) : (
        <>
          {/* Flash Deals */}
          {flashDeals.length > 0 && (
       <section
    id="flash-deals"
    className="section-container scroll-mt-32"
>            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <h2 className="font-display text-xl font-bold text-[#0F172A] sm:text-2xl">Flash Deals</h2>
                  <div className="flex items-center gap-1.5 rounded-xl bg-[#EF44441A] px-3 py-1.5">
                    <Timer size={14} className="text-[#EF4444]" />
                    <CountdownTimer endsAt={flashDealEnd} />
                  </div>
                </div>
                <Link to="/products?flashDeal=true" className="text-sm font-semibold text-[#2563EB]">View All →</Link>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {flashDeals.map((p) => <ProductCard key={p._id} product={p} compact />)}
              </div>
            </section>
          )}

          {/* Trending Products */}
          {trending.length > 0 && (
            <section
    id="trending-products"
    className="section-container scroll-mt-32"
>
              <SectionHeading
                title="Trending Products"
                eyebrow="Hot Right Now"
                action={<Link to="/products" className="text-sm font-semibold text-[#2563EB]">View All →</Link>}
              />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {trending.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            </section>
          )}

          {/* Best Sellers */}
          {bestSellers.length > 0 && (
           <section
    id="best-sellers"
    className="section-container scroll-mt-32"
>
              <SectionHeading
                title="Best Sellers"
                eyebrow="Customer Favorites"
                action={<Link to="/products?sort=bestselling" className="text-sm font-semibold text-[#2563EB]">View All →</Link>}
              />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {bestSellers.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            </section>
          )}

         
          {/* New Arrivals */}
          {newArrivals.length > 0 && (
<section
    id="new-arrivals"
    className="section-container scroll-mt-32"
>            <SectionHeading
                title="New Arrivals"
                eyebrow="Just Landed"
                action={<Link to="/products?sort=newest" className="text-sm font-semibold text-[#2563EB]">View All →</Link>}
              />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {newArrivals.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            </section>
          )}
        </>
      )}

       {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <section className="section-container">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
                <div>
                  <SectionHeading title="Recently Viewed" eyebrow="Your History" />
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {recentlyViewed.slice(0, 4).map((p) => (
                      <ProductCard key={p._id} product={p} />
                    ))}
                  </div>
                </div>
                {/* Newsletter */}
                <div className="flex flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] p-8 text-white">
                  <p className="font-display text-xl font-bold">Subscribe to our Newsletter</p>
                  <p className="mt-2 text-sm text-white/80">Get exclusive offers, new arrivals & more.</p>
                  <div className="mt-5 flex overflow-hidden rounded-xl border border-white/30">
                    <input type="email" placeholder="Enter your email" className="flex-1 bg-white/10 px-2 py-2.5 text-sm text-white placeholder:text-white/60 outline-none" />
                    <button className="bg-white px-1 py-2.5 text-sm font-semibold text-[#2563EB]">Subscribe</button>
                  </div>
                </div>
              </div>
            </section>
          )}

      {/* Newsletter (fallback when no recently viewed) */}
      {recentlyViewed.length === 0 && !loading && (
        <section className="section-container">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] px-8 py-14 text-center text-white">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Get 10% Off Your First Order</h2>
            <p className="mx-auto mt-2 max-w-md text-white/70">Subscribe for exclusive deals and updates.</p>
            <form className="mx-auto mt-6 flex max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
              <input type="email" required placeholder="Enter your email" className="input-field flex-1 !border-white/20 !bg-white/10 !text-white placeholder:!text-white/50" />
              <button className="btn-primary !px-6">Subscribe</button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
