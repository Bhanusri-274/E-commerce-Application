import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, pages, onChange }) => {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>

      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`h-9 w-9 rounded-xl text-sm font-medium transition ${
            p === page
              ? "bg-[#2563EB] text-white shadow-md"
              : "border border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB]"
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === pages}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
