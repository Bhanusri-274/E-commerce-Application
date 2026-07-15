import { useState, useEffect, useRef } from "react";
import { Link,  useNavigate,useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import {
  Search, Heart, ShoppingCart, User, Menu, X,
  LogOut, Package, ChevronDown, LayoutDashboard, Grid3X3,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { categoryService } from "../../services";

const topLinks = [
  { to: "/", label: "Home", type: "nav", end: true },

  { to: "/#trending-products", label: "Trending" },

  { to: "/#flash-deals", label: "Deals", type: "hash" },

  { to: "/#new-arrivals", label: "New Arrivals", type: "hash" },

  { to: "/#best-sellers", label: "Best Sellers", type: "hash" },

  { to: "/orders", label: "Track Order", type: "nav" },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();
  const profileRef = useRef(null);
  const categoryRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeNav, setActiveNav] = useState("home");
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryService.list().then((r) => setCategories(r.data)).catch(() => {});
  }, []);



useEffect(() => {
  if (location.pathname !== "/") {
    if (location.pathname.startsWith("/orders")) {
      setActiveNav("orders");
    } else {
      setActiveNav("");
    }
    return;
  }

  const sections = [
    { id: "home", nav: "home" },
    { id: "flash-deals", nav: "deals" },
    { id: "trending-products", nav: "trending" },
    { id: "best-sellers", nav: "best" },
    { id: "new-arrivals", nav: "new" },
  ];

  const handleScroll = () => {
    const scrollPosition = window.scrollY + 180;

    let current = "home";

    for (const section of sections) {
      const element = document.getElementById(section.id);

      if (element && scrollPosition >= element.offsetTop) {
        current = section.nav;
      }
    }

    setActiveNav(current);
  };

  handleScroll();

  window.addEventListener("scroll", handleScroll);

  return () => window.removeEventListener("scroll", handleScroll);
}, [location.pathname]);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      categoryRef.current &&
      !categoryRef.current.contains(event.target)
    ) {
      setCatOpen(false);
    }
    if (profileRef.current && !profileRef.current.contains(event.target)) {
      setProfileOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);


  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query ? `/products?keyword=${encodeURIComponent(query)}` : "/products");
    setMobileOpen(false);
  };

  const navClass = (name) =>
  `border-b-2 px-4 py-3 text-sm font-medium transition-all duration-300 ${
    activeNav === name
      ? "border-[#2563EB] text-[#2563EB]"
      : "border-transparent text-[#64748B] hover:text-[#2563EB]"
  }`;

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white shadow-sm">
      {/* Top bar */}
      <div className="section-container flex h-16 items-center gap-3">
        {/* Mobile menu */}
        <button className="lg:hidden" onClick={() => setMobileOpen((v) => !v)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-1.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] font-display text-lg font-bold text-white">S</span>
          <div className="hidden sm:block">
            <p className="font-display text-lg font-extrabold leading-none text-[#0F172A]">
              Shop<span className="text-[#2563EB]">EZ</span>
            </p>
            <p className="text-[10px] text-[#64748B]">Shop Smarter. Live Better.</p>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden flex-1 md:flex">
          <div className="flex w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] focus-within:border-[#2563EB] focus-within:ring-4 focus-within:ring-[#2563EB1A]">
            <div className="relative flex flex-1 items-center">
              <Search size={16} className="pointer-events-none absolute left-4 text-[#94A3B8]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, brands and more..."
                className="w-full bg-transparent py-3 pl-11 pr-4 text-sm text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
              />
            </div>
           
            <button type="submit" className="flex items-center justify-center bg-[#2563EB] px-5 text-white hover:bg-[#1d4ed8]">
              <Search size={18} />
            </button>
          </div>
        </form>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link to="/wishlist" className="relative flex flex-col items-center gap-0.5 px-2 py-1 text-[#64748B] hover:text-[#2563EB]">
            <Heart size={22} />
            <span className="hidden text-[10px] font-medium sm:block">Wishlist</span>
            {wishlist?.products?.length > 0 && (
              <span className="absolute -right-0.5 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#F97316] text-[9px] font-bold text-white">
                {wishlist.products.length}
              </span>
            )}
          </Link>

          <Link to="/cart" className="relative flex flex-col items-center gap-0.5 px-2 py-1 text-[#64748B] hover:text-[#2563EB]">
            <div className="relative">
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-[9px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="hidden text-[10px] font-medium sm:block">Cart</span>
          </Link>

          {user ? (
      <div className="relative" ref={profileRef}>              
        <button
                onClick={() => setProfileOpen((v) => !v)}
                // onBlur={() => setTimeout(() => setProfileOpen(false), 180)}
                className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] px-3 py-2 hover:border-[#2563EB]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs text-[#64748B]">Hi, {user.name?.split(" ")[0]}</p>
                </div>
                <ChevronDown size={14} className="hidden text-[#94A3B8] sm:block" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[#E2E8F0] bg-white py-2 shadow-xl">
                  <p className="truncate px-4 py-2 text-xs text-[#64748B]">{user.email}</p>
                  <hr className="border-[#E2E8F0]" />
                  <Link to="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#0F172A] hover:bg-[#F8FAFC]">
                    <User size={15} className="text-[#64748B]" /> My Profile
                  </Link>
                  <Link to="/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#0F172A] hover:bg-[#F8FAFC]">
                    <Package size={15} className="text-[#64748B]" /> My Orders
                  </Link>
                  {user.role === "admin" && (
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#0F172A] hover:bg-[#F8FAFC]">
                      <LayoutDashboard size={15} className="text-[#64748B]" /> Admin Dashboard
                    </Link>
                  )}
                  <hr className="border-[#E2E8F0]" />
                  <button onClick={logout} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[#EF4444] hover:bg-[#FEF2F2]">
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary !px-4 !py-2 text-sm">Sign In</Link>
          )}
        </div>
      </div>

      {/* Secondary nav */}
      <div className="hidden border-t border-[#F1F5F9] bg-white lg:block">
        <div className="section-container flex items-center gap-1 py-0">
          {/* Categories mega button */}
            <div className="relative" ref={categoryRef}>            <button
              onClick={() => setCatOpen((v) => !v)}
              // onBlur={() => setTimeout(() => setCatOpen(false), 180)}
              className="flex items-center gap-2 rounded-none border-b-2 border-transparent bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
            >
              <Grid3X3 size={16} /> Categories <ChevronDown size={14} />
            </button>
            {catOpen && (
              <div className="absolute left-0 top-full z-50 min-w-[200px] rounded-2xl border border-[#E2E8F0] bg-white py-2 shadow-xl">
                {categories.map((c) => (
                  <Link key={c._id} 
                  to={`/products?category=${c._id}`} 
                   onClick={() => setCatOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#0F172A] hover:bg-[#F8FAFC] hover:text-[#2563EB]">
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

         <Link to="/" className={navClass("home")}>
  Home
</Link>

<HashLink smooth to="/#flash-deals" className={navClass("deals")}>
  Deals
</HashLink>

<HashLink smooth to="/#trending-products" className={navClass("trending")}>
  Trending
</HashLink>

<HashLink smooth to="/#best-sellers" className={navClass("best")}>
  Best Sellers
</HashLink>

<HashLink smooth to="/#new-arrivals" className={navClass("new")}>
  New Arrivals
</HashLink>

<Link to="/orders" className={navClass("orders")}>
  Track Order
</Link>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-[#E2E8F0] bg-white px-4 pb-4 pt-3 lg:hidden">
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="input-field pl-11" />
            </div>
          </form>
          <div className="space-y-1">
            {topLinks.map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#64748B] hover:bg-[#F8FAFC]">{label}</Link>
            ))}
            <hr className="my-2 border-[#E2E8F0]" />
            <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Categories</p>
            {categories.map((c) => (
              <Link key={c._id} to={`/products?category=${c._id}`} onClick={() => setMobileOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-[#64748B] hover:bg-[#F8FAFC]">{c.name}</Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
