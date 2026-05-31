export default function KPICard({ label, value, tone }) {
  return (
    <article className={`kpi-card ${tone}`}>
      <p className="kpi-label">{label}</p>
      <h3 className="kpi-value">{value}</h3>
    </article>
  );
}
