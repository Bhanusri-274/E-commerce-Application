import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, FolderTree, Image,
  ClipboardList, Users, Ticket, Star, Settings,
  LogOut, Menu, X, BarChart3,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/admin",            label: "Dashboard",  icon: LayoutDashboard, end: true },
  { to: "/admin/products",   label: "Products",   icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/banners",    label: "Banners",    icon: Image },
  { to: "/admin/orders",     label: "Orders",     icon: ClipboardList },
  { to: "/admin/users",      label: "Users",      icon: Users },
  { to: "/admin/coupons",    label: "Coupons",    icon: Ticket },
  { to: "/admin/reviews",    label: "Reviews",    icon: Star },
  { to: "/admin/analytics",  label: "Analytics",  icon: BarChart3 },
  { to: "/admin/settings",   label: "Settings",   icon: Settings },
];

const SidebarContent = ({ user, logout, navigate, onClose }) => (
  <div className="flex h-full flex-col">
    {/* Logo */}
    <div className="flex items-center justify-between border-b border-[#E2E8F0] p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] font-display text-base font-bold text-white">S</span>
        <div>
          <p className="font-display text-base font-bold leading-tight text-[#0F172A]">ShopEZ</p>
          <p className="text-[10px] text-[#64748B]">Admin Panel</p>
        </div>
      </div>
      {onClose && <button onClick={onClose} className="lg:hidden rounded-lg p-1.5 hover:bg-[#F8FAFC]"><X size={18}/></button>}
    </div>

    {/* Nav */}
    <nav className="flex-1 space-y-0.5 overflow-y-auto p-4">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to} to={to} end={end} onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-[#2563EB] text-white shadow-[0_4px_16px_-4px_rgba(37,99,235,0.45)]"
                : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            }`
          }
        >
          <Icon size={17}/> {label}
        </NavLink>
      ))}
    </nav>

    {/* User section */}
    <div className="border-t border-[#E2E8F0] p-4">
      <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] p-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB] font-bold text-white">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#0F172A]">{user?.name}</p>
          <p className="truncate text-xs text-[#64748B]">Super Admin</p>
        </div>
      </div>
      <button
        onClick={() => { logout(); navigate("/admin/login"); }}
        className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[#EF4444] hover:bg-[#FEF2F2]"
      >
        <LogOut size={16}/> Sign Out
      </button>
    </div>
  </div>
);

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#E2E8F0] bg-white lg:block">
        <SidebarContent user={user} logout={logout} navigate={navigate}/>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)}/>
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl">
            <SidebarContent user={user} logout={logout} navigate={navigate} onClose={() => setMobileOpen(false)}/>
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-64">
        {/* Mobile topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#E2E8F0] bg-white px-4 lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-1.5 hover:bg-[#F8FAFC]">
            <Menu size={22}/>
          </button>
          <span className="font-display font-bold text-[#0F172A]">ShopEZ Admin</span>
        </header>
        <main className="p-4 lg:p-8">
          <Outlet/>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
