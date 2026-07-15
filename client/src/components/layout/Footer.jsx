import { Link } from "react-router-dom";
import { Globe, Camera, Send, Mail, Smartphone } from "lucide-react";

const Footer = () => (
  <footer className="mt-16 bg-[#0F172A] text-white">
    {/* Main Footer */}
    <div className="section-container grid grid-cols-2 gap-8 py-12 md:grid-cols-5">
      {/* Brand */}
      <div className="col-span-2 md:col-span-1">
        <Link to="/" className="flex items-center gap-1.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] font-display text-lg font-bold text-white">S</span>
          <span className="font-display text-xl font-extrabold">Shop<span className="text-[#2563EB]">EZ</span></span>
        </Link>
        <p className="mt-3 text-sm text-white/60">Your one-stop destination for the best products at the best prices.</p>
        <div className="mt-4 flex gap-2">
          {[Globe, Camera, Send].map((Icon, i) => (
            <a key={i} href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/60 transition hover:bg-[#2563EB] hover:text-white">
              <Icon size={14} />
            </a>
          ))}
        </div>
      </div>

      {/* Shop */}
      <div>
        <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/40">Shop</h4>
        <ul className="space-y-2.5 text-sm text-white/70">
          {[["All Categories","/products"],["Electronics","/products"],["Fashion","/products"],["Home & Kitchen","/products"],["Sports","/products"],["Beauty","/products"]].map(([label, to]) => (
            <li key={label}><Link to={to} className="hover:text-white">{label}</Link></li>
          ))}
        </ul>
      </div>

      {/* Customer Care */}
      <div>
        <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/40">Customer Care</h4>
        <ul className="space-y-2.5 text-sm text-white/70">
          {[["Track Order","/orders"],["Returns","#"],["Shipping Info","#"],["FAQ","#"],["Contact Us","#"]].map(([label, to]) => (
            <li key={label}><Link to={to} className="hover:text-white">{label}</Link></li>
          ))}
        </ul>
      </div>

      {/* Company */}
      <div>
        <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/40">Company</h4>
        <ul className="space-y-2.5 text-sm text-white/70">
          {[["About Us","#"],["Careers","#"],["Privacy Policy","#"],["Terms & Conditions","#"]].map(([label, to]) => (
            <li key={label}><Link to={to} className="hover:text-white">{label}</Link></li>
          ))}
        </ul>
      </div>

      {/* App & Newsletter */}
      <div>
        <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/40">Download App</h4>
        <div className="space-y-2">
          {["Google Play", "App Store"].map((s) => (
            <a key={s} href="#" className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-semibold hover:bg-white/20">
              <Smartphone size={16} className="text-white/60" /> {s}
            </a>
          ))}
        </div>
        <div className="mt-5">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-white/40">Newsletter</h4>
          <div className="flex overflow-hidden rounded-xl border border-white/20">
            <input type="email" placeholder="Enter your email" className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none" />
            <button className="bg-[#2563EB] px-3 py-2"><Mail size={15} /></button>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-white/10">
      <div className="section-container flex flex-wrap items-center justify-between gap-4 py-4">
        <p className="text-xs text-white/40">© 2025 ShopEZ. All rights reserved.</p>
        <div className="flex items-center gap-2">
          {["VISA","MasterCard","UPI","PayTm"].map((b) => (
            <span key={b} className="rounded-md border border-white/20 px-2.5 py-1 text-[10px] font-bold text-white/60">{b}</span>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
