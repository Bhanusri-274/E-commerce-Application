import { forwardRef } from "react";

const Input = forwardRef(({ label, error, icon: Icon, className = "", ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="mb-1.5 block text-sm font-medium text-[#0F172A]">{label}</label>
    )}
    <div className="relative">
      {Icon && (
        <Icon
          size={15}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
        />
      )}
      <input
        ref={ref}
        className={`input-field ${Icon ? "pl-11" : ""} ${
          error ? "!border-[#EF4444] !ring-[#EF44441A]" : ""
        } ${className}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-xs text-[#EF4444]">{error}</p>}
  </div>
));

Input.displayName = "Input";
export default Input;
