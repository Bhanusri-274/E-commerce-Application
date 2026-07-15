import { useEffect, useState } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Tooltip, Legend, Filler,
} from "chart.js";
import { TrendingUp, TrendingDown, IndianRupee, ShoppingBag, Users } from "lucide-react";
import Loader from "../../components/common/Loader";
import { adminService } from "../../services";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtPrice = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

const Trend = ({ pct }) => {
  const up = pct >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
      {up ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
      {Math.abs(pct)}% vs last month
    </span>
  );
};

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.dashboard().then((dash) => {
      // Use dashboard data which already has monthlySales, orderStatusBreakdown, etc.
      setData(dash.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen />;

  const salesLabels  = data.monthlySales.map((m) => MONTHS[m._id.month - 1]);
  const salesRevenue = data.monthlySales.map((m) => m.total);
  const salesOrders  = data.monthlySales.map((m) => m.count);

  const barData = {
    labels: salesLabels,
    datasets: [
      {
        label: "Revenue (₹)",
        data: salesRevenue,
        backgroundColor: "rgba(37,99,235,0.85)",
        borderRadius: 6,
        yAxisID: "y",
      },
    ],
  };

  const lineData = {
    labels: salesLabels,
    datasets: [
      {
        label: "Orders",
        data: salesOrders,
        borderColor: "#F97316",
        backgroundColor: "rgba(249,115,22,0.1)",
        fill: true, tension: 0.4,
        pointBackgroundColor: "#F97316",
        pointRadius: 4,
      },
    ],
  };

  const statusColors = ["#FACC15","#2563EB","#4F46E5","#F97316","#22C55E","#EF4444"];
  const donutData = {
    labels: data.orderStatusBreakdown.map((s) => s._id),
    datasets: [{
      data: data.orderStatusBreakdown.map((s) => s.count),
      backgroundColor: statusColors, borderWidth: 0, hoverOffset: 4,
    }],
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => fmtPrice(c.raw) } } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#F1F5F9" }, ticks: { callback: (v) => `₹${(v/1000).toFixed(0)}k` } },
    },
  };
  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: "#F1F5F9" } } },
  };

  const compCards = [
    { label: "Revenue This Month",  value: fmtPrice(data.revenue), icon: IndianRupee, color: "#22C55E", pct: 12 },
    { label: "Total Orders",        value: data.totalOrders,        icon: ShoppingBag,  color: "#2563EB", pct: 8  },
    { label: "Total Customers",     value: data.totalUsers,         icon: Users,        color: "#F97316", pct: 15 },
    { label: "Total Products",      value: data.totalProducts,      icon: ShoppingBag,  color: "#4F46E5", pct: 5  },
  ];

  return (
    <div className="space-y-7">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0F172A]">Analytics</h1>
        <p className="text-sm text-[#64748B]">Store performance overview and key metrics.</p>
      </div>

      {/* Comparison cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {compCards.map((c) => (
          <div key={c.label} className="card-surface p-5">
            <div className="flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${c.color}1A`, color: c.color }}>
                <c.icon size={18}/>
              </span>
              <Trend pct={c.pct}/>
            </div>
            <p className="mt-4 font-display text-2xl font-bold text-[#0F172A]">{c.value}</p>
            <p className="text-sm text-[#64748B]">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card-surface p-5">
          <h3 className="mb-4 font-display font-semibold text-[#0F172A]">Monthly Revenue</h3>
          {salesLabels.length > 0
            ? <Bar data={barData} options={barOptions}/>
            : <p className="py-10 text-center text-sm text-[#94A3B8]">No data yet</p>}
        </div>

        <div className="card-surface p-5">
          <h3 className="mb-4 font-display font-semibold text-[#0F172A]">Order Volume</h3>
          {salesLabels.length > 0
            ? <Line data={lineData} options={lineOptions}/>
            : <p className="py-10 text-center text-sm text-[#94A3B8]">No data yet</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* Donut */}
        <div className="card-surface flex flex-col items-center p-5">
          <h3 className="mb-3 self-start font-display font-semibold text-[#0F172A]">Order Status</h3>
          <div className="relative w-full max-w-[220px]">
            <Doughnut data={donutData} options={{ cutout:"68%", plugins:{ legend:{ position:"bottom", labels:{ font:{ size:11 }, boxWidth:12 } } } }}/>
          </div>
        </div>

        {/* Recent orders table */}
        <div className="card-surface p-5">
          <h3 className="mb-4 font-display font-semibold text-[#0F172A]">Recent Orders</h3>
          <table className="w-full text-sm">
            <thead className="border-b border-[#E2E8F0] text-left text-xs text-[#64748B]">
              <tr>
                <th className="pb-2 font-medium">Order</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr key={o._id} className="border-b border-[#E2E8F0] last:border-0">
                  <td className="py-2.5 font-mono text-xs font-semibold text-[#0F172A]">#{o.orderNumber}</td>
                  <td className="py-2.5 text-[#64748B]">{o.user?.name}</td>
                  <td className="py-2.5 font-semibold">{fmtPrice(o.totalPrice)}</td>
                  <td className="py-2.5">
                    <span className="rounded-full bg-[#2563EB1A] px-2 py-0.5 text-[10px] font-semibold text-[#2563EB]">
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
