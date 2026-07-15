import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const Breadcrumb = ({ items }) => (
  <nav className="mb-5 flex items-center gap-1.5 text-sm text-[#64748B]">
    {items.map((item, i) => (
      <span key={i} className="flex items-center gap-1.5">
        {i > 0 && <ChevronRight size={14} className="text-[#CBD5E1]" />}
        {item.to ? (
          <Link to={item.to} className="hover:text-[#2563EB]">
            {item.label}
          </Link>
        ) : (
          <span className="font-medium text-[#0F172A]">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);

export default Breadcrumb;
