import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler,
} from "chart.js";
import { Users, Package, ClipboardList, IndianRupee, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import Loader from "../../components/common/Loader";
import { adminService, productService } from "../../services";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtPrice = (v) => `₹${Number(v||0).toLocaleString("en-IN")}`;

const statusColors = {
  Pending:"bg-[#FACC151A] text-[#CA8A04]", Confirmed:"bg-[#2563EB1A] text-[#2563EB]",
  Packed:"bg-[#4F46E51A] text-[#4F46E5]",  Shipped:"bg-[#F973161A] text-[#F97316]",
  Delivered:"bg-[#22C55E1A] text-[#22C55E]", Cancelled:"bg-[#EF44441A] text-[#EF4444]",
};

const AdminDashboard = () => {
  const [data,    setData]    = useState(null);
  const [topProds,setTopProds]= useState([]);

  useEffect(() => {
    adminService.dashboard().then((r) => setData(r.data));
    productService.list({ sort: "bestselling", limit: 5 }).then((r) => setTopProds(r.data));
  }, []);

  if (!data) return <Loader fullScreen />;

  const cards = [
    { label: "Total Users",    value: data.totalUsers,             icon: Users,         color: "#2563EB", trend: +12.5 },
    { label: "Total Products", value: data.totalProducts,          icon: Package,        color: "#4F46E5", trend: +8.2  },
    { label: "Total Orders",   value: data.totalOrders,            icon: ClipboardList,  color: "#F97316", trend: +15.3 },
    { label: "Total Revenue",  value: fmtPrice(data.revenue),      icon: IndianRupee,    color: "#22C55E", trend: +18.6 },
  ];

  const lineData = {
    labels: data.monthlySales.map((m) => MONTHS[m._id.month - 1]),
    datasets: [{
      label: "Revenue (₹)",
      data: data.monthlySales.map((m) => m.total),
      borderColor: "#2563EB",
      backgroundColor: "rgba(37,99,235,0.08)",
      fill: true, tension: 0.4,
      pointBackgroundColor: "#2563EB", pointRadius: 4, pointHoverRadius: 6,
    }],
  };

  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => fmtPrice(ctx.raw) } } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#F1F5F9" }, ticks: { callback: (v) => `₹${(v/1000).toFixed(0)}k` } },
    },
  };

  const donutColors = ["#FACC15","#2563EB","#4F46E5","#F97316","#22C55E","#EF4444"];
  const doughnutData = {
    labels: data.orderStatusBreakdown.map((s) => s._id),
    datasets: [{
      data: data.orderStatusBreakdown.map((s) => s.count),
      backgroundColor: donutColors, borderWidth: 0, hoverOffset: 4,
    }],
  };
  const doughnutOptions = {
    responsive: true, cutout: "70%",
    plugins: { legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 12 } } },
  };

  const totalOrdersForDonut = data.orderStatusBreakdown.reduce((s, x) => s + x.count, 0);

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0F172A]">Dashboard</h1>
        <p className="text-sm text-[#64748B]">Welcome back, Admin. Here's what's happening with your store.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card-surface p-5">
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor:`${c.color}1A`, color: c.color }}>
                <c.icon size={20} />
              </span>
              <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${c.trend >= 0 ? "bg-[#22C55E1A] text-[#22C55E]" : "bg-[#EF44441A] text-[#EF4444]"}`}>
                {c.trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {Math.abs(c.trend)}%
              </span>
            </div>
            <p className="mt-4 font-display text-2xl font-bold text-[#0F172A]">{c.value}</p>
            <p className="text-sm text-[#64748B]">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        {/* Sales line */}
        <div className="card-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display font-semibold text-[#0F172A]">Sales Overview</h3>
            <select className="input-field !w-auto !py-1 text-xs">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          {data.monthlySales.length > 0
            ? <Line data={lineData} options={lineOptions} />
            : <div className="flex h-40 items-center justify-center text-sm text-[#94A3B8]">No sales data yet</div>}
        </div>

        {/* Orders donut */}
        <div className="card-surface flex flex-col items-center p-5">
          <h3 className="mb-2 self-start font-display font-semibold text-[#0F172A]">Orders Overview</h3>
          <div className="relative flex-1 flex items-center justify-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div className="pointer-events-none absolute flex flex-col items-center">
              <p className="font-display text-2xl font-bold text-[#0F172A]">{totalOrdersForDonut}</p>
              <p className="text-xs text-[#64748B]">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Recent Orders */}
        <div className="card-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display font-semibold text-[#0F172A]">Recent Orders</h3>
            <Link to="/admin/orders" className="flex items-center gap-1 text-xs font-semibold text-[#2563EB]">View all <ArrowRight size={13} /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-left text-xs text-[#64748B]">
                  <th className="pb-2 font-medium">Order ID</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o._id} className="border-b border-[#E2E8F0] last:border-0">
                    <td className="py-2.5 font-mono text-xs font-semibold text-[#0F172A]">#{o.orderNumber}</td>
                    <td className="py-2.5 text-[#64748B]">{o.user?.name}</td>
                    <td className="py-2.5 font-semibold text-[#0F172A]">{fmtPrice(o.totalPrice)}</td>
                    <td className="py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColors[o.status]}`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="card-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display font-semibold text-[#0F172A]">Top Selling Products</h3>
            <Link to="/admin/products" className="flex items-center gap-1 text-xs font-semibold text-[#2563EB]">View all <ArrowRight size={13} /></Link>
          </div>
          <div className="space-y-3">
            {topProds.length === 0 && <p className="text-sm text-[#94A3B8]">No products yet</p>}
            {topProds.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-xs font-bold text-[#64748B]">{i + 1}</span>
                {p.images?.[0]?.url
                  ? <img src={p.images[0].url} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                  : <div className="h-10 w-10 rounded-lg bg-[#F1F5F9]" />}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-[#0F172A]">{p.name}</p>
                  <p className="text-xs text-[#64748B]">{p.numSold || 0} sold</p>
                </div>
                <p className="shrink-0 text-sm font-bold text-[#0F172A]">{fmtPrice(p.discountPrice || p.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
