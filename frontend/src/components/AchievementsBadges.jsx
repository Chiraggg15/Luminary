import { useMemo } from 'react';
import { Trophy, Star, Zap, Target, TrendingUp, Briefcase, FileText, MessageSquare } from 'lucide-react';

const ALL_BADGES = [
  { id: 'first_resume',   icon: FileText,      color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',    title: 'First Steps',       desc: 'Created your first resume',        check: (r, j) => r.length >= 1 },
  { id: 'five_resumes',   icon: FileText,      color: 'text-indigo-400',  bg: 'bg-indigo-500/10 border-indigo-500/20',title: 'Resume Machine',    desc: 'Created 5+ resumes',               check: (r) => r.length >= 5 },
  { id: 'ai_assisted',    icon: Zap,           color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20',title: 'AI Pioneer',        desc: 'Used AI to generate resume content',check: (r) => r.some(x => x.is_ai_generated) },
  { id: 'high_score',     icon: TrendingUp,    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20',title: 'ATS Master',       desc: 'Achieved 80%+ ATS score',          check: (r) => r.some(x => x.ats_score >= 80) },
  { id: 'perfect_score',  icon: Trophy,        color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',  title: 'Perfection',        desc: 'Achieved 95%+ ATS score',          check: (r) => r.some(x => x.ats_score >= 95) },
  { id: 'job_tracker',    icon: Briefcase,     color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/20',    title: 'Job Hunter',        desc: 'Added 5+ job applications',        check: (r, j) => j.length >= 5 },
  { id: 'got_interview',  icon: MessageSquare, color: 'text-pink-400',    bg: 'bg-pink-500/10 border-pink-500/20',    title: 'Interview Ready',   desc: 'Moved a job to Interview stage',    check: (r, j) => j.some(x => x.status === 'interview') },
  { id: 'got_offer',      icon: Star,          color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20',title: '🎉 Offer Received', desc: 'Received a job offer!',            check: (r, j) => j.some(x => x.status === 'offer') },
  { id: 'multi_resume',   icon: Target,        color: 'text-teal-400',    bg: 'bg-teal-500/10 border-teal-500/20',    title: 'Diversified',       desc: 'Scored 70%+ on 3+ resumes',       check: (r) => r.filter(x => x.ats_score >= 70).length >= 3 },
];

export default function AchievementsBadges({ resumes = [], jobs = [] }) {
  const badges = useMemo(() => {
    return ALL_BADGES.map(b => ({ ...b, unlocked: b.check(resumes, jobs) }));
  }, [resumes, jobs]);

  const unlocked = badges.filter(b => b.unlocked);
  const locked   = badges.filter(b => !b.unlocked);

  return (
    <div className="glass-panel overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Trophy size={15} className="text-amber-400" /> Achievements
        </h3>
        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
          {unlocked.length}/{badges.length}
        </span>
      </div>
      <div className="p-4 space-y-2">
        {unlocked.map(b => {
          const Icon = b.icon;
          return (
            <div key={b.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${b.bg}`}>
              <div className={`w-7 h-7 rounded-lg ${b.bg} flex items-center justify-center shrink-0`}>
                <Icon size={14} className={b.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${b.color}`}>{b.title}</p>
                <p className="text-[11px] text-zinc-500">{b.desc}</p>
              </div>
            </div>
          );
        })}
        {locked.slice(0, 3).map(b => {
          const Icon = b.icon;
          return (
            <div key={b.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-zinc-800/60 opacity-40">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-zinc-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-500">{b.title}</p>
                <p className="text-[11px] text-zinc-600">{b.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
