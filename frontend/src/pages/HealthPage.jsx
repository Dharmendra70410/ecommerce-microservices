import { useEffect, useState } from "react";
import { getSystemHealth } from "../services/api";

const serviceKeys = [
  ["gateway", "API Gateway"],
  ["orderService", "Order Service"],
  ["inventoryService", "Inventory Service"],
  ["paymentWorker", "Payment Worker"],
  ["redis", "Redis"]
];

export default function HealthPage() {
  const [health, setHealth] = useState({});

  useEffect(() => {
    getSystemHealth().then(setHealth);
  }, []);

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>System Health</h2>
        <span>Last refresh: {new Date(health.updatedAt || Date.now()).toLocaleTimeString()}</span>
      </div>

      <div className="health-grid">
        {serviceKeys.map(([key, label]) => {
          const status = String(health[key] || "unknown").toLowerCase();
          const ok = status === "ok" || status === "healthy" || status === "up";

          return (
            <article key={key} className={`health-card ${ok ? "health-ok" : "health-bad"}`}>
              <h3>{label}</h3>
              <p>{status.toUpperCase()}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
