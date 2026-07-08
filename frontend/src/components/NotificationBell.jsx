import { useState, useRef, useEffect } from 'react';
import { Bell, FileText, Sparkles, TrendingUp, CheckCircle2, Briefcase, X } from 'lucide-react';

/**
 * NotificationBell
 * Generates smart in-app notifications from resumes + jobs data.
 * No backend needed — derives events client-side.
 */
export default function NotificationBell({ resumes = [], jobs = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Build notifications
  const notifications = [];

  resumes.forEach(r => {
    if (r.ats_score >= 80) {
      notifications.push({ id: `ats-${r.id}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', title: 'High ATS Score!', body: `"${r.title}" scored ${r.ats_score}% — ready to apply!`, time: r.updated_at });
    }
    if (!r.ats_score) {
      notifications.push({ id: `unscored-${r.id}`, icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', title: 'Resume Not Analyzed', body: `"${r.title}" hasn't been analyzed yet. Run ATS check.`, time: r.created_at });
    }
    if (r.is_ai_generated) {
      notifications.push({ id: `ai-${r.id}`, icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', title: 'AI Resume Ready', body: `AI-generated content applied to "${r.title}"`, time: r.created_at });
    }
  });

  const interviewJobs = jobs.filter(j => j.status === 'interview');
  if (interviewJobs.length > 0) {
    notifications.push({ id: 'interview-pending', icon: Briefcase, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', title: `${interviewJobs.length} Interview${interviewJobs.length > 1 ? 's' : ''} Pending`, body: interviewJobs.map(j => j.company).join(', '), time: new Date().toISOString() });
  }

  const offerJobs = jobs.filter(j => j.status === 'offer');
  if (offerJobs.length > 0) {
    notifications.push({ id: 'offers', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', title: `🎉 ${offerJobs.length} Offer${offerJobs.length > 1 ? 's' : ''} Received!`, body: offerJobs.map(j => j.company).join(', '), time: new Date().toISOString() });
  }

  const sorted = notifications.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);
  const unread = sorted.length;

  const formatTime = (t) => {
    const diff = Date.now() - new Date(t).getTime();
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor(diff / 60000);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return 'Just now';
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`relative p-2 rounded-lg border transition-colors ${open ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'}`}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-zinc-950 text-[9px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-[fadeIn_0.15s_ease-out]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
            <span className="text-sm font-semibold text-white">Notifications</span>
            <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white"><X size={15} /></button>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60">
            {sorted.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">No notifications yet</div>
            ) : sorted.map(n => {
              const Icon = n.icon;
              return (
                <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-zinc-800/30 transition-colors">
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${n.bg}`}>
                    <Icon size={13} className={n.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-200 font-medium">{n.title}</p>
                    <p className="text-xs text-zinc-500 truncate">{n.body}</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">{formatTime(n.time)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
