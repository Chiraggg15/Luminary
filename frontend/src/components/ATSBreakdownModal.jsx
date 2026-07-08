import { useState } from 'react';
import { X, CheckCircle2, XCircle, Lightbulb, TrendingUp, BarChart3, Target } from 'lucide-react';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * ATSBreakdownModal
 * -----------------
 * Opens a modal that shows a detailed ATS analysis of a resume vs. a job description.
 * Displays: overall score, found/missing keywords, per-section scores, and improvement tips.
 */
export default function ATSBreakdownModal({ resume, onClose }) {
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('input'); // 'input' | 'result'

  // Build a plain-text representation of the resume for the AI
  const buildResumeText = (r) => {
    const pi = r.personal_info || {};
    const parts = [
      pi.full_name, pi.email, pi.location,
      pi.summary,
      ...(r.experience || []).map(e => `${e.position} at ${e.company}: ${e.description}`),
      ...(r.education || []).map(e => `${e.degree} in ${e.field_of_study} from ${e.institution}`),
      ...(r.skills?.technical || []),
      ...(r.skills?.soft || []),
      ...(r.projects || []).map(p => `${p.name}: ${p.description}`),
    ];
    return parts.filter(Boolean).join('\n');
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please paste a job description to analyze against');
      return;
    }
    setLoading(true);
    try {
      const resumeText = buildResumeText(resume);
      const res = await aiAPI.analyzeDetailed({ resume_text: resumeText, job_description: jobDescription });
      setAnalysis(res.data.analysis);
      setStep('result');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s) => {
    if (s >= 70) return { text: 'text-emerald-400', bar: 'bg-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
    if (s >= 50) return { text: 'text-amber-400',   bar: 'bg-amber-500',   bg: 'bg-amber-500/10 border-amber-500/20'   };
    return         { text: 'text-red-400',    bar: 'bg-red-500',    bg: 'bg-red-500/10 border-red-500/20'     };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Target size={16} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">ATS Score Breakdown</h2>
              <p className="text-zinc-500 text-xs">{resume.title || 'Untitled Resume'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {step === 'input' ? (
            <div className="p-6 space-y-5">
              <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4">
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Paste the <span className="text-white font-medium">job description</span> you're targeting. 
                  The AI will analyze your resume against it and show exactly which keywords match and what's missing.
                </p>
              </div>
              <div>
                <label className="label-glass">Job Description *</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="input-glass w-full resize-none text-sm"
                  rows={10}
                  placeholder="Paste the full job description here..."
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="btn-accent w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" /> Analyzing...</>
                ) : (
                  <><BarChart3 size={16} /> Run Detailed Analysis</>
                )}
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Overall Score */}
              <div className={`rounded-xl border p-5 flex items-center justify-between ${scoreColor(analysis.score).bg}`}>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Overall ATS Match</p>
                  <p className={`text-4xl font-bold ${scoreColor(analysis.score).text}`}>{analysis.score}%</p>
                </div>
                <TrendingUp size={36} className={scoreColor(analysis.score).text + ' opacity-30'} />
              </div>

              {/* Section Scores */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Section Scores</h3>
                <div className="space-y-3">
                  {Object.entries(analysis.section_scores).map(([section, score]) => {
                    const c = scoreColor(score);
                    return (
                      <div key={section}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-zinc-300 capitalize">{section}</span>
                          <span className={`text-xs font-bold ${c.text}`}>{score}%</span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${c.bar}`} style={{ width: `${score}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Found Keywords */}
              {analysis.found_keywords.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" /> Found Keywords ({analysis.found_keywords.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.found_keywords.map((kw) => (
                      <span key={kw} className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Keywords */}
              {analysis.missing_keywords.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                    <XCircle size={14} className="text-red-400" /> Missing Keywords ({analysis.missing_keywords.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missing_keywords.map((kw) => (
                      <span key={kw} className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-400">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {analysis.suggestions.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                    <Lightbulb size={14} className="text-amber-400" /> Improvement Tips
                  </h3>
                  <div className="space-y-2">
                    {analysis.suggestions.map((tip, i) => (
                      <div key={i} className="flex gap-3 bg-zinc-800/40 border border-zinc-700/40 rounded-lg px-4 py-3">
                        <span className="text-amber-400 font-bold text-xs mt-0.5 shrink-0">{i + 1}.</span>
                        <p className="text-zinc-300 text-sm">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => { setStep('input'); setAnalysis(null); }}
                className="btn-secondary w-full text-xs"
              >
                Analyze Against Different Job
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
