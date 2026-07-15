import { Link } from "react-router-dom";

const EmptyState = ({ icon: Icon, title, description, actionLabel, actionTo }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2E8F0] bg-white px-6 py-20 text-center">
    {Icon && (
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2563EB0D]">
        <Icon className="h-7 w-7 text-[#2563EB]" />
      </div>
    )}
    <h3 className="font-display text-lg font-semibold text-[#0F172A]">{title}</h3>
    {description && <p className="mt-2 max-w-sm text-sm text-[#64748B]">{description}</p>}
    {actionLabel && actionTo && (
      <Link to={actionTo} className="btn-primary mt-6">
        {actionLabel}
      </Link>
    )}
  </div>
);

export default EmptyState;
