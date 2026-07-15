const variants = {
  success: "bg-[#22C55E1A] text-[#22C55E]",
  danger:  "bg-[#EF44441A] text-[#EF4444]",
  warning: "bg-[#FACC151A] text-[#CA8A04]",
  info:    "bg-[#2563EB1A] text-[#2563EB]",
  purple:  "bg-[#4F46E51A] text-[#4F46E5]",
  orange:  "bg-[#F973161A] text-[#F97316]",
  default: "bg-[#E2E8F0]  text-[#64748B]",
};

const Badge = ({ children, variant = "default", className = "" }) => (
  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}>
    {children}
  </span>
);

export default Badge;
