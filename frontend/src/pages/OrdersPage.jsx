import { useEffect, useMemo, useState } from "react";
import { getOrders } from "../services/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getOrders().then(setOrders);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) {
      return orders;
    }

    const needle = search.toLowerCase();
    return orders.filter((order) => {
      const orderId = String(order.id || order.orderId || "").toLowerCase();
      const userId = String(order.userId || "").toLowerCase();
      const status = String(order.status || "").toLowerCase();
      return orderId.includes(needle) || userId.includes(needle) || status.includes(needle);
    });
  }, [orders, search]);

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Order Tracking</h2>
        <input
          className="search-input"
          placeholder="Search by order id, user id, status"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Status</th>
              <th>Total</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order, idx) => (
              <tr key={order.id || order.orderId || idx}>
                <td>{order.id || order.orderId || "-"}</td>
                <td>{order.userId || "-"}</td>
                <td>
                  <span className={`status-badge status-${String(order.status || "unknown").toLowerCase()}`}>
                    {order.status || "UNKNOWN"}
                  </span>
                </td>
                <td>{order.total ?? order.amount ?? "-"}</td>
                <td>{new Date(order.createdAt || Date.now()).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
