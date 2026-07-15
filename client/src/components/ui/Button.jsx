import { Loader2 } from "lucide-react";

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-semibold border border-[#EF4444] text-[#EF4444] hover:bg-[#FEF2F2] transition-all duration-300",
};

const Button = ({
  children,
  variant = "primary",
  loading = false,
  className = "",
  ...props
}) => (
  <button
    {...props}
    disabled={loading || props.disabled}
    className={`${variants[variant]} ${className}`}
  >
    {loading && <Loader2 size={16} className="animate-spin" />}
    {children}
  </button>
);

export default Button;
