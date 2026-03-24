import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Trash2, Edit3, Settings, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { resumeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [resumes,  setResumes]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await resumeAPI.getAll();
      setResumes(res.data.resumes || []);
    } catch {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this resume?')) return;
    setDeleting(id);
    try {
      await resumeAPI.delete(id);
      setResumes(prev => prev.filter(r => r.id !== id));
      toast.success('Resume deleted successfully.');
    } catch {
      toast.error('Failed to delete resume.');
    } finally {
      setDeleting(null);
    }
  };

  const getScoreColor = (score) => {
    if (score == null) return 'text-zinc-500 bg-zinc-800/50 border-zinc-700/50';
    if (score >= 70) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="animate-[fadeIn_0.3s_ease-out] max-w-6xl mx-auto w-full">
      {/* ── Header Area ──────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 pt-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            My Documents
          </h1>
          <p className="text-zinc-400 text-sm">
            Manage your ATS-optimized resumes and tracking statistics across all job applications.
          </p>
        </div>
        <button
          className="btn-primary flex items-center gap-2 pr-5"
          onClick={() => navigate('/resume/new')}
        >
          <Plus size={18} /> Create New
        </button>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="glass-panel p-5 flex flex-col justify-between h-32 hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-semibold uppercase tracking-widest">Total Active</span>
            <FileText size={18} className="text-zinc-500" />
          </div>
          <div className="text-4xl font-bold text-white tracking-tight">{resumes.length}</div>
        </div>
        <div className="glass-panel p-5 flex flex-col justify-between h-32 hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-semibold uppercase tracking-widest">High Match (≥70%)</span>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <div className="text-4xl font-bold text-white tracking-tight">
            {resumes.filter(r => r.ats_score >= 70).length}
          </div>
        </div>
        <div className="glass-panel p-5 flex flex-col justify-between h-32 hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-semibold uppercase tracking-widest">AI Assisted</span>
            <Sparkles size={18} className="text-blue-500" />
          </div>
          <div className="text-4xl font-bold text-white tracking-tight">
            {resumes.filter(r => r.is_ai_generated).length}
          </div>
        </div>
      </div>

      {/* ── Resumes Grid ───────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <button className="text-sm font-medium text-emerald-400 hover:text-emerald-300">View History</button>
        </div>

        {loading ? (
          <div className="glass-panel h-64 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin mb-4" />
            <span className="text-zinc-500 text-sm font-medium">Loading workspace...</span>
          </div>
        ) : resumes.length === 0 ? (
          <div className="glass-panel p-16 flex flex-col items-center justify-center text-center border-dashed border-zinc-800">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-600 mb-6 border border-zinc-800">
              <FileText size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No documents found</h3>
            <p className="text-zinc-400 mb-6 max-w-sm text-sm">
              You haven't created any resumes yet. Start building your first ATS-optimized profile.
            </p>
            <button className="btn-secondary flex items-center gap-2" onClick={() => navigate('/resume/new')}>
              <Plus size={16} /> Create Resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="glass-panel flex flex-col cursor-pointer hover:border-zinc-600 transition-all group overflow-hidden"
                onClick={() => navigate(`/resume/${resume.id}`)}
              >
                <div className="p-6 flex-1 flex flex-col">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-5">
                    <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 group-hover:text-white group-hover:bg-zinc-800 transition-colors">
                      <FileText size={20} />
                    </div>
                    {/* ATS Badge */}
                    <div className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${getScoreColor(resume.ats_score)}`}>
                      {resume.ats_score != null ? `Match: ${resume.ats_score}%` : 'Unscored'}
                    </div>
                  </div>

                  {/* Body */}
                  <h4 className="text-lg font-semibold text-zinc-100 mb-1 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                    {resume.title || 'Untitled Document'}
                  </h4>
                  <p className="text-zinc-500 text-sm mb-6 line-clamp-1 h-5">
                    {resume.personal_info?.full_name || 'Incomplete Profile'}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    {resume.is_ai_generated && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
                        <Sparkles size={10} /> AI Assisted
                      </span>
                    )}
                    <span className="inline-block px-2 py-1 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 text-[10px] font-semibold uppercase tracking-widest">
                      Updated {new Date(resume.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                    </span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="border-t border-zinc-800/80 bg-zinc-900/30 px-4 py-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <button className="p-2 text-zinc-400 hover:text-white rounded transition-colors" title="Settings">
                      <Settings size={16} />
                    </button>
                    <button className="p-2 text-zinc-400 hover:text-emerald-400 rounded transition-colors" title="Edit">
                      <Edit3 size={16} />
                    </button>
                  </div>
                  <button
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    onClick={(e) => handleDelete(resume.id, e)}
                    disabled={deleting === resume.id}
                    title="Delete Permanently"
                  >
                    {deleting === resume.id ? (
                      <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
