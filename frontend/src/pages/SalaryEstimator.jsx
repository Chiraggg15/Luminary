import { useState } from 'react';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';
import { DollarSign, TrendingUp, MapPin, Briefcase, Star, Building2, Zap } from 'lucide-react';

const EXPERIENCE_LEVELS = [
  { label: 'Entry Level (0-2 yrs)', value: 1 },
  { label: 'Mid Level (3-5 yrs)', value: 4 },
  { label: 'Senior (6-9 yrs)', value: 7 },
  { label: 'Lead / Principal (10+ yrs)', value: 12 },
];

function SalaryBar({ min, mid, max }) {
  const total = max - min || 1;
  const midPct = ((mid - min) / total) * 100;
  return (
    <div className="relative w-full">
      <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-300 rounded-full w-full" />
      </div>
      {/* Mid marker */}
      <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${midPct}%` }}>
        <div className="w-5 h-5 bg-white rounded-full border-2 border-emerald-400 shadow-lg shadow-emerald-500/40 -translate-x-1/2" />
      </div>
      <div className="flex justify-between mt-2 text-xs text-zinc-500 font-mono">
        <span>${min.toLocaleString()}</span>
        <span className="text-emerald-400 font-bold">${mid.toLocaleString()} avg</span>
        <span>${max.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default function SalaryEstimator() {
  const [form, setForm]       = useState({ job_title: '', location: 'United States', experience_years: 1, skills: '' });
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEstimate = async (e) => {
    e.preventDefault();
    if (!form.job_title) { toast.error('Job title is required'); return; }
    setLoading(true);
    try {
      const skills = form.skills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await aiAPI.estimateSalary({ ...form, skills, experience_years: Number(form.experience_years) });
      setResult(res.data.salary);
      toast.success('Salary estimate ready!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Estimation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-[fadeIn_0.3s_ease-out] w-full pt-4">
      {/* Header */}
      <div className="mb-8 border-b border-zinc-800 pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <DollarSign size={28} className="text-emerald-500" /> Salary Estimator
        </h1>
        <p className="text-zinc-400 text-sm max-w-2xl">
          Get AI-powered salary estimates for any role and location. Know your market worth before negotiating.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 glass-panel p-6">
          <form onSubmit={handleEstimate} className="space-y-5">
            <div>
              <label className="label-glass">Job Title *</label>
              <input className="input-glass text-sm" value={form.job_title}
                onChange={e => setForm({...form, job_title: e.target.value})} placeholder="Software Engineer" required />
            </div>
            <div>
              <label className="label-glass flex items-center gap-1.5"><MapPin size={13} /> Location</label>
              <input className="input-glass text-sm" value={form.location}
                onChange={e => setForm({...form, location: e.target.value})} placeholder="San Francisco, CA" />
            </div>
            <div>
              <label className="label-glass">Experience Level</label>
              <select className="input-glass text-sm" value={form.experience_years}
                onChange={e => setForm({...form, experience_years: e.target.value})}>
                {EXPERIENCE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label-glass">Key Skills <span className="text-zinc-600 font-normal">(csv)</span></label>
              <input className="input-glass text-sm" value={form.skills}
                onChange={e => setForm({...form, skills: e.target.value})} placeholder="React, Python, AWS" />
            </div>
            <button type="submit" disabled={loading} className="btn-accent w-full flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" /> Estimating...</>
                : <><TrendingUp size={16} /> Estimate Salary</>}
            </button>
          </form>
        </div>

        {/* Result */}
        <div className="lg:col-span-3 space-y-5">
          {!result ? (
            <div className="glass-panel h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12">
              <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                <DollarSign size={28} className="text-zinc-600" />
              </div>
              <p className="text-zinc-500 text-sm">Fill in the details to get your salary estimate</p>
            </div>
          ) : (
            <>
              {/* Main Salary Card */}
              <div className="glass-panel p-6 border-emerald-500/20 bg-emerald-500/5">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 flex items-center gap-2">
                  <TrendingUp size={13} /> Market Salary Range
                </p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">${result.mid.toLocaleString()}</span>
                  <span className="text-zinc-400 ml-2 text-sm">/year avg</span>
                </div>
                <SalaryBar min={result.min} mid={result.mid} max={result.max} />
              </div>

              {/* Market Insight */}
              {result.market_insight && (
                <div className="glass-panel p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-2"><Star size={12} /> Market Insight</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">{result.market_insight}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Top Companies */}
                {result.top_companies?.length > 0 && (
                  <div className="glass-panel p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2"><Building2 size={12} /> Top Hirers</p>
                    <div className="space-y-2">
                      {result.top_companies.map(c => (
                        <div key={c} className="text-sm text-zinc-200 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {c}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* High-pay Skills */}
                {result.in_demand_skills?.length > 0 && (
                  <div className="glass-panel p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2"><Zap size={12} /> High-Pay Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {result.in_demand_skills.map(s => (
                        <span key={s} className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
