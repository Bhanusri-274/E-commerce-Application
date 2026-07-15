import { Star } from "lucide-react";

const Rating = ({ value = 0, count, size = 14 }) => (
  <div className="flex items-center gap-1">
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(value) ? "fill-[#FACC15] text-[#FACC15]" : "fill-[#E2E8F0] text-[#E2E8F0]"}
        />
      ))}
    </div>
    {typeof count === "number" && <span className="text-xs text-[#64748B]">({count})</span>}
  </div>
);

export default Rating;
