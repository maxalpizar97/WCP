export default function KpiCard({ label, value, sub }) {
  return (
    <div className="card flex flex-col gap-1 min-w-[140px] flex-1">
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
      {sub && <span className="text-xs text-slate-500">{sub}</span>}
    </div>
  );
}
