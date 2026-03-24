import { useState } from 'react';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';
import { PenTool, Copy, Check, Sparkles, MoveRight, FileText } from 'lucide-react';

export default function CoverLetter() {
  const [formData, setFormData] = useState({ job_title: '', company: '', job_description: '', skills: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.job_title || !formData.company) {
      toast.error('Job Title and Company are required');
      return;
    }
    setLoading(true);
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await aiAPI.generateCoverLetter({ ...formData, skills: skillsArray });
      setResult(res.data.cover_letter);
      toast.success('Cover letter generated instantly.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto animate-[fadeIn_0.3s_ease-out] w-full pt-4">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-8 border-b border-zinc-800 pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <PenTool size={28} className="text-emerald-500" />
          Cover Letter Engine
        </h1>
        <p className="text-zinc-400 text-sm max-w-2xl">
          Instantly draft a highly targeted, professional cover letter formatted perfectly to bypass hiring screeners and highlight your exact relevance to the role.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Form Sidebar ────────────────────────────────────────── */}
        <div className="lg:col-span-5 glass-panel p-6">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            Target Details
          </h3>
          <form className="space-y-5" onSubmit={handleGenerate}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-glass">Job Title *</label>
                <input name="job_title" className="input-glass text-sm" value={formData.job_title} onChange={handleChange} placeholder="Frontend Developer" required />
              </div>
              <div>
                <label className="label-glass">Company *</label>
                <input name="company" className="input-glass text-sm" value={formData.company} onChange={handleChange} placeholder="Stripe" required />
              </div>
            </div>

            <div>
              <label className="label-glass">Relevant Skills <span className="text-zinc-600 font-normal">(csv)</span></label>
              <input name="skills" className="input-glass text-sm" value={formData.skills} onChange={handleChange} placeholder="React, TypeScript, Next.js" />
            </div>

            <div>
              <label className="label-glass">Job Description <span className="text-zinc-600 font-normal">(Recommended)</span></label>
              <textarea name="job_description" className="input-glass text-sm resize-y" rows="6" value={formData.job_description} onChange={handleChange} placeholder="Paste the job requirements here to perfectly tailor the letter..." />
            </div>

            <button type="submit" className="btn-accent w-full mt-4 h-11 text-sm flex gap-2" disabled={loading}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" />
              ) : (
                <>Run Generator <MoveRight size={16} /></>
              )}
            </button>
          </form>
        </div>

        {/* ── Output Window ───────────────────────────────────────── */}
        <div className="lg:col-span-7 glass-panel p-6 flex flex-col h-full min-h-[600px] border-zinc-800 bg-zinc-950/50">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Sparkles size={14} className="text-emerald-500" /> Output Document
            </h3>
            {result && (
              <button 
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-zinc-300 hover:text-white px-3 py-1.5 rounded-md border border-zinc-700 hover:border-zinc-500 transition-colors bg-zinc-900"
              >
                {copied ? <><Check size={14} className="text-emerald-500"/> Copied</> : <><Copy size={14}/> Copy Text</>}
              </button>
            )}
          </div>
          
          <div className="flex-1 text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-serif overflow-auto">
            {result ? (
              <div className="animate-[fadeIn_0.5s_ease-out]">{result}</div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                <FileText size={48} className="mb-4 text-zinc-800" />
                <p>Fill out the target details and click generate to begin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
