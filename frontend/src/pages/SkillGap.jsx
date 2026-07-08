import { useState } from 'react';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Target, CheckCircle2, XCircle, BookOpen, Clock, Zap, ArrowRight } from 'lucide-react';

function MatchRing({ score }) {
  const r = 48, c = 2 * Math.PI * r;
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444';
  return (
    <svg width="120" height="120" className="-rotate-90">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#27272a" strokeWidth="8" />
      <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={c} strokeDashoffset={c - (score / 100) * c}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
      <text x="60" y="60" textAnchor="middle" dominantBaseline="central"
        transform="rotate(90,60,60)" fill={color} fontSize="22" fontWeight="bold">{score}%</text>
    </svg>
  );
}

export default function SkillGap() {
  const [form, setForm]       = useState({ target_role: '', current_skills: '', experience_years: 0 });
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!form.target_role) { toast.error('Target role is required'); return; }
    setLoading(true);
    try {
      const skills = form.current_skills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await aiAPI.analyzeSkillGap({ ...form, current_skills: skills, experience_years: Number(form.experience_years) });
      setResult(res.data.gap);
      toast.success('Skill gap analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-[fadeIn_0.3s_ease-out] w-full pt-4">
      {/* Header */}
      <div className="mb-8 border-b border-zinc-800 pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <Target size={28} className="text-emerald-500" /> Skill Gap Analyzer
        </h1>
        <p className="text-zinc-400 text-sm max-w-2xl">
          Compare your current skills to your target role and get a personalized learning roadmap to close the gap.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 glass-panel p-6">
          <form onSubmit={handleAnalyze} className="space-y-5">
            <div>
              <label className="label-glass">Target Role *</label>
              <input className="input-glass text-sm" value={form.target_role}
                onChange={e => setForm({...form, target_role: e.target.value})} placeholder="Full Stack Developer" required />
            </div>
            <div>
              <label className="label-glass">Experience Level (Years)</label>
              <input type="number" min="0" max="20" className="input-glass text-sm" value={form.experience_years}
                onChange={e => setForm({...form, experience_years: e.target.value})} />
            </div>
            <div>
              <label className="label-glass">Your Current Skills <span className="text-zinc-600 font-normal">(csv)</span></label>
              <textarea className="input-glass text-sm resize-none" rows={4} value={form.current_skills}
                onChange={e => setForm({...form, current_skills: e.target.value})}
                placeholder="React, JavaScript, HTML, CSS, Git..." />
            </div>
            <button type="submit" disabled={loading} className="btn-accent w-full flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" /> Analyzing...</>
                : <><Zap size={16} /> Analyze Gap</>}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="lg:col-span-3 space-y-5">
          {!result ? (
            <div className="glass-panel min-h-[400px] flex flex-col items-center justify-center text-center p-12">
              <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                <Target size={28} className="text-zinc-600" />
              </div>
              <p className="text-zinc-500 text-sm">Enter your target role and current skills to begin analysis</p>
            </div>
          ) : (
            <>
              {/* Match Score */}
              <div className="glass-panel p-6 flex items-center gap-6">
                <MatchRing score={result.match_score} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Skill Match Score</p>
                  <p className="text-white font-semibold text-lg mb-1">
                    {result.match_score >= 70 ? '🎯 Strong Match' : result.match_score >= 45 ? '📈 Partial Match' : '🚀 Learning Opportunity'}
                  </p>
                  {result.timeline && (
                    <p className="text-zinc-400 text-sm flex items-center gap-1.5">
                      <Clock size={13} /> Est. time to close gap: <span className="text-white font-medium">{result.timeline}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Matching Skills */}
              {result.matching_skills?.length > 0 && (
                <div className="glass-panel p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" /> You Already Have ({result.matching_skills.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.matching_skills.map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {result.missing_skills?.length > 0 && (
                <div className="glass-panel p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                    <XCircle size={14} className="text-red-400" /> Gaps to Fill ({result.missing_skills.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.missing_skills.map(s => (
                      <span key={s} className={`px-2.5 py-1 rounded-md text-xs font-medium border ${result.priority_learn?.includes(s) ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {result.priority_learn?.includes(s) && '⭐ '}{s}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-600 mt-2">⭐ = Priority to learn first</p>
                </div>
              )}

              {/* Learning Resources */}
              {result.resources?.length > 0 && (
                <div className="glass-panel p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                    <BookOpen size={14} className="text-blue-400" /> Recommended Learning
                  </p>
                  <div className="space-y-2">
                    {result.resources.map((r, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-zinc-300 bg-zinc-800/40 border border-zinc-700/40 rounded-lg px-4 py-2.5">
                        <ArrowRight size={13} className="text-blue-400 shrink-0" /> {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
