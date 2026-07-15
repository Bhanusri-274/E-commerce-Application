import { TrendingUp } from "lucide-react";

const StatCard = ({ label, value, icon: Icon, color = "#2563EB", trend }) => (
  <div className="card-surface flex flex-col gap-4 p-5">
    <div className="flex items-center justify-between">
      <span
        className="flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        <Icon size={20} />
      </span>
      {trend !== undefined && (
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
            trend >= 0 ? "bg-[#22C55E1A] text-[#22C55E]" : "bg-[#EF44441A] text-[#EF4444]"
          }`}
        >
          <TrendingUp size={11} />
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div>
      <p className="font-display text-2xl font-bold text-[#0F172A]">{value}</p>
      <p className="mt-0.5 text-sm text-[#64748B]">{label}</p>
    </div>
  </div>
);

export default StatCard;
