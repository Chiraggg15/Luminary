import { FileText, PenTool, MessageSquare, Sparkles, TrendingUp, Clock } from 'lucide-react';

/**
 * ActivityFeed
 * ------------
 * Derives a list of recent activities from the user's resumes array.
 * Shows resume creations, updates, AI-assisted items, and high-score achievements.
 */
export default function ActivityFeed({ resumes }) {
  // Build activity events from resume data
  const buildEvents = () => {
    const events = [];

    resumes.forEach((r) => {
      // Creation event
      events.push({
        id: `create-${r.id}`,
        type: 'created',
        title: r.title || 'Untitled Resume',
        timestamp: new Date(r.created_at || r.updated_at),
        icon: FileText,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10 border-blue-500/20',
        label: 'Resume created',
      });

      // AI assisted
      if (r.is_ai_generated) {
        events.push({
          id: `ai-${r.id}`,
          type: 'ai',
          title: r.title || 'Untitled Resume',
          timestamp: new Date(r.created_at || r.updated_at),
          icon: Sparkles,
          color: 'text-purple-400',
          bg: 'bg-purple-500/10 border-purple-500/20',
          label: 'AI content generated',
        });
      }

      // High ATS score achievement
      if (r.ats_score != null && r.ats_score >= 70) {
        events.push({
          id: `score-${r.id}`,
          type: 'score',
          title: r.title || 'Untitled Resume',
          timestamp: new Date(r.updated_at || r.created_at),
          icon: TrendingUp,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/20',
          label: `ATS score: ${r.ats_score}% (High Match)`,
        });
      }
    });

    // Sort by newest first, cap at 8
    return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, 8);
  };

  const formatTime = (date) => {
    const diff = Date.now() - date.getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  < 1)   return 'Just now';
    if (mins  < 60)  return `${mins}m ago`;
    if (hours < 24)  return `${hours}h ago`;
    if (days  < 7)   return `${days}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const events = buildEvents();

  if (events.length === 0) {
    return (
      <div className="glass-panel p-8 flex flex-col items-center justify-center text-center">
        <Clock size={32} className="text-zinc-700 mb-3" />
        <p className="text-zinc-500 text-sm">No recent activity yet. Start building your first resume!</p>
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
        <span className="text-xs text-zinc-500">{events.length} events</span>
      </div>
      <div className="divide-y divide-zinc-800/60">
        {events.map((event) => {
          const Icon = event.icon;
          return (
            <div key={event.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-zinc-800/20 transition-colors">
              <div className={`mt-0.5 w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${event.bg}`}>
                <Icon size={13} className={event.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200 font-medium truncate">{event.label}</p>
                <p className="text-xs text-zinc-500 truncate mt-0.5">{event.title}</p>
              </div>
              <span className="text-[11px] text-zinc-600 mt-0.5 flex-shrink-0">{formatTime(event.timestamp)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
