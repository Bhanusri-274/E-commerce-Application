import { NavLink } from "react-router-dom";
import { Home, Search, ShoppingCart, Heart, User } from "lucide-react";
import { useCart } from "../../context/CartContext";

const MobileBottomNav = () => {
  const { itemCount } = useCart();

  const links = [
    { to: "/",         icon: Home,         label: "Home"    },
    { to: "/products", icon: Search,        label: "Search"  },
    { to: "/cart",     icon: ShoppingCart,  label: "Cart",   badge: itemCount },
    { to: "/wishlist", icon: Heart,         label: "Saved"   },
    { to: "/profile",  icon: User,          label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E2E8F0] bg-white/95 backdrop-blur-md pb-safe sm:hidden">
      <div className="flex">
        {links.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-0.5 py-3 text-[10px] font-medium transition ${
                isActive ? "text-[#2563EB]" : "text-[#94A3B8]"
              }`
            }
          >
            <div className="relative">
              <Icon size={21} />
              {badge > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB] text-[9px] font-bold text-white">
                  {badge}
                </span>
              )}
            </div>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
