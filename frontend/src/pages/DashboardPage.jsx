import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { getGatewayBaseUrl, getOrders } from "../services/api";

function KPI({ label, value, tone }) {
  return (
    <article className={`kpi-card ${tone}`}>
      <p>{label}</p>
      <h3>{value}</h3>
    </article>
  );
}

function groupOrdersByDay(orders) {
  const buckets = new Map();

  orders.forEach((order) => {
    const date = new Date(order.createdAt || order.timestamp || Date.now());
    const key = date.toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) || 0) + 1);
  });

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, count]) => ({ date, count }));
}

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getOrders().then((data) => {
      if (!isMounted) {
        return;
      }
      setOrders(data);
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const total = orders.length;
    const paid = orders.filter((order) => order.status === "PAID").length;
    const pending = orders.filter((order) => order.status === "PENDING").length;
    const failed = orders.filter((order) => order.status === "FAILED").length;

    return { total, paid, pending, failed };
  }, [orders]);

  const chartData = useMemo(() => groupOrdersByDay(orders), [orders]);

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Operations Snapshot</h2>
        <span>{loading ? "Loading..." : `Gateway: ${getGatewayBaseUrl()}`}</span>
      </div>

      <div className="kpi-grid">
        <KPI label="Total Orders" value={stats.total} tone="tone-gold" />
        <KPI label="Paid" value={stats.paid} tone="tone-green" />
        <KPI label="Pending" value={stats.pending} tone="tone-blue" />
        <KPI label="Failed" value={stats.failed} tone="tone-red" />
      </div>

      <div className="chart-wrap">
        <h3>Orders Over Last 7 Days</h3>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff8b3d" stopOpacity={0.85} />
                  <stop offset="95%" stopColor="#ff8b3d" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#3f3f46" />
              <XAxis dataKey="date" tick={{ fill: "#f5f5f4", fontSize: 12 }} />
              <YAxis tick={{ fill: "#f5f5f4", fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#ff8b3d"
                fill="url(#ordersGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
