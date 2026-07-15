const SectionHeading = ({ eyebrow, title, subtitle, action }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">{eyebrow}</p>}
      <h2 className="mt-1 font-display text-2xl font-bold text-[#0F172A] sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-[#64748B]">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export default SectionHeading;
