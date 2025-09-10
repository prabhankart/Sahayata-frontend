// soft status chips
export default function StatusPill({ value = "Open" }) {
  const map = {
    Open: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    "In Progress": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    Resolved: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    "On Hold": "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${map[value] || map.Open}`}>
      {value}
    </span>
  );
}
