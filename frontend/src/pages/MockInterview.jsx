import { useState } from 'react';
import { interviewAPI } from '../services/api';
import toast from 'react-hot-toast';
import { MessageSquare, Cpu, ChevronDown, ChevronRight, Hash } from 'lucide-react';

export default function MockInterview() {
  const [formData, setFormData] = useState({ job_title: '', experience: 0, skills: '' });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(0);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.job_title) {
      toast.error('Job Title is required');
      return;
    }
    setLoading(true);
    setExpandedIndex(0);
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
      const res = await interviewAPI.generateQuestions({ ...formData, experience: Number(formData.experience), skills: skillsArray, question_count: 6 });
      setQuestions(res.data.questions);
      toast.success('Interview models generated.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate models');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-[fadeIn_0.3s_ease-out] w-full pt-4">
      {/* Header */}
      <div className="mb-8 border-b border-zinc-800 pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <MessageSquare size={28} className="text-emerald-500" />
          Technical Interview Prep
        </h1>
        <p className="text-zinc-400 text-sm max-w-2xl">
          Generate realistic technical and behavioral question models tailored to specific roles to help you calibrate your answers before the actual interview.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left column: Setup Form */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-5">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest flex items-center gap-2">
              <Cpu size={16} className="text-emerald-500" /> Config
            </h3>
            <form className="space-y-4" onSubmit={handleGenerate}>
              <div>
                <label className="label-glass">Target Role</label>
                <input name="job_title" className="input-glass text-sm px-3 py-2" value={formData.job_title} onChange={handleChange} placeholder="e.g. Data Scientist" required />
              </div>
              <div>
                <label className="label-glass">Experience (Years)</label>
                <input type="number" name="experience" className="input-glass text-sm px-3 py-2" value={formData.experience} onChange={handleChange} min="0" max="30" />
              </div>
              <div>
                <label className="label-glass">Core Stack</label>
                <input name="skills" className="input-glass text-sm px-3 py-2" value={formData.skills} onChange={handleChange} placeholder="Python, SQL" />
              </div>
              <button type="submit" className="btn-secondary w-full text-xs uppercase tracking-widest mt-2" disabled={loading}>
                {loading ? 'Processing...' : 'Generate Q&A'}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Questions Array */}
        <div className="lg:col-span-3">
          {questions.length === 0 ? (
            <div className="glass-panel h-full flex flex-col items-center justify-center p-16 text-center min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-6">
                <Hash size={24} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">No active session</h3>
              <p className="text-zinc-500 text-sm max-w-sm">Use the config panel to feed constraints into the engine layout the problem domain.</p>
            </div>
          ) : (
            <div className="glass-panel overflow-hidden border-zinc-800">
              <div className="bg-zinc-900/50 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white uppercase tracking-widest">Question Bank</h3>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">{questions.length} Items</span>
              </div>
              
              <div className="divide-y divide-zinc-800/80">
                {questions.map((q, i) => {
                  const isExpanded = expandedIndex === i;
                  return (
                    <div key={i} className="group">
                      {/* Accordion Header */}
                      <button 
                        onClick={() => setExpandedIndex(isExpanded ? null : i)}
                        className={`w-full text-left px-6 py-5 flex items-start gap-4 transition-colors ${isExpanded ? 'bg-zinc-900' : 'hover:bg-zinc-900/50'}`}
                      >
                        <div className={`mt-0.5 p-1 rounded-sm border ${isExpanded ? 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] bg-emerald-500 text-black' : 'border-zinc-700 text-zinc-500 group-hover:border-zinc-500'}`}>
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                        <div className="flex-1 pr-6">
                          <span className={`text-sm font-mono mr-3 font-semibold ${isExpanded ? 'text-emerald-500' : 'text-zinc-600'}`}>{(i+1).toString().padStart(2, '0')}</span>
                          <span className={`${isExpanded ? 'text-white font-medium' : 'text-zinc-300'}`}>{q.question}</span>
                        </div>
                      </button>
                      
                      {/* Accordion Body */}
                      <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="pl-10">
                          <div className="border-l-2 border-emerald-500/30 pl-5 py-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-2 block">Optimal Structure</span>
                            <p className="text-zinc-400 text-sm leading-relaxed font-serif whitespace-pre-wrap">
                              {q.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
