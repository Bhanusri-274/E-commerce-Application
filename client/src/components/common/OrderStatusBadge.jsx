const statusMap = {
  Pending:   { className: "bg-[#FACC151A] text-[#CA8A04]" },
  Confirmed: { className: "bg-[#2563EB1A] text-[#2563EB]" },
  Packed:    { className: "bg-[#4F46E51A] text-[#4F46E5]" },
  Shipped:   { className: "bg-[#F973161A] text-[#F97316]" },
  Delivered: { className: "bg-[#22C55E1A] text-[#22C55E]" },
  Cancelled: { className: "bg-[#EF44441A] text-[#EF4444]" },
};

const OrderStatusBadge = ({ status }) => {
  const cfg = statusMap[status] || statusMap.Pending;
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cfg.className}`}>
      {status}
    </span>
  );
};

export default OrderStatusBadge;
