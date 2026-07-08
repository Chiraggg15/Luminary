/**
 * ApplicationsChart — Donut chart for job application statuses
 * Pure CSS/SVG — no external chart library needed.
 */

const STATUS_CONFIG = {
  wishlist:  { label: 'Wishlist',  color: '#71717a' },
  applied:   { label: 'Applied',   color: '#60a5fa' },
  interview: { label: 'Interview', color: '#fbbf24' },
  offer:     { label: 'Offer',     color: '#34d399' },
  rejected:  { label: 'Rejected',  color: '#f87171' },
};

function DonutChart({ data, total }) {
  const r = 52, stroke = 14;
  const c = 2 * Math.PI * r;
  let cumulative = 0;

  return (
    <div className="relative inline-block">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#27272a" strokeWidth={stroke} />
        {data.filter(d => d.count > 0).map((d, i) => {
          const pct = d.count / total;
          const dash = pct * c;
          const gap  = c - dash;
          const offset = -cumulative * c;
          cumulative += pct;
          return (
            <circle key={i} cx="70" cy="70" r={r} fill="none"
              stroke={d.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
        <span className="text-2xl font-bold text-white">{total}</span>
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Total</span>
      </div>
    </div>
  );
}

export default function ApplicationsChart({ jobs = [] }) {
  const counts = Object.fromEntries(Object.keys(STATUS_CONFIG).map(k => [k, 0]));
  jobs.forEach(j => { if (counts[j.status] !== undefined) counts[j.status]++; });
  const total = jobs.length;

  const data = Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
    key, label: cfg.label, color: cfg.color, count: counts[key]
  }));

  if (total === 0) return (
    <div className="glass-panel p-6 text-center">
      <p className="text-zinc-600 text-sm">No job applications yet. <a href="/job-tracker" className="text-emerald-400 hover:underline">Start tracking →</a></p>
    </div>
  );

  return (
    <div className="glass-panel p-5">
      <p className="text-sm font-semibold text-white mb-4">Application Pipeline</p>
      <div className="flex items-center gap-6">
        <DonutChart data={data} total={total} />
        <div className="space-y-2 flex-1">
          {data.filter(d => d.count > 0).map(d => (
            <div key={d.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-zinc-300">{d.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(d.count / total) * 100}%`, backgroundColor: d.color }} />
                </div>
                <span className="text-xs font-bold text-zinc-400 w-4 text-right">{d.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
