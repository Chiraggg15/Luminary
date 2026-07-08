import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, FileText, Trash2, Edit3, Sparkles,
  CheckCircle2, Download, FileDown, BarChart3, Copy, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { resumeAPI, docxAPI, pdfAPI, jobAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ATSBreakdownModal from '../components/ATSBreakdownModal';
import ActivityFeed from '../components/ActivityFeed';
import AchievementsBadges from '../components/AchievementsBadges';
import ApplicationsChart from '../components/ApplicationsChart';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [resumes,  setResumes]  = useState([]);
  const [jobs,     setJobs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [atsModal, setAtsModal] = useState(null);
  const [shareModal, setShareModal] = useState(null); // { resume, token }
  const [copiedId,   setCopiedId]   = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [rRes, jRes] = await Promise.all([resumeAPI.getAll(), jobAPI.getAll()]);
      setResumes(rRes.data.resumes || []);
      setJobs(jRes.data.jobs || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDownloadDOCX = async (resume, e) => {
    e.stopPropagation();
    const id = toast.loading(`Generating ${resume.title || 'resume'}...`);
    try {
      const res = await docxAPI.generate(resume);
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${resume.title || 'resume'}.docx`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); window.URL.revokeObjectURL(url);
      toast.success('DOCX exported!', { id });
    } catch { toast.error('Failed to generate DOCX', { id }); }
  };

  const handleOpenPDF = (resume, e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    const url   = pdfAPI.getUrl(resume.id);
    const win   = window.open('', '_blank');
    if (!win) { toast.error('Allow popups to open PDF view'); return; }
    win.document.write(`<html><head><title>Loading...</title></head><body style="background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh"><p>Loading resume...</p><script>fetch("${url}",{headers:{Authorization:"Bearer ${token}"}}).then(r=>r.text()).then(html=>{document.open();document.write(html);document.close();window.print();}).catch(()=>{document.body.innerHTML='<p style=color:red>Failed.</p>';});<\/script></body></html>`);
    win.document.close();
  };

  const handleClone = async (resume, e) => {
    e.stopPropagation();
    try {
      const clone = { ...resume, title: `${resume.title} (Copy)`, ats_score: null, is_public: false, share_token: null };
      delete clone.id;
      const res = await resumeAPI.create(clone);
      setResumes(prev => [res.data.resume, ...prev]);
      toast.success('Resume cloned!');
    } catch { toast.error('Failed to clone resume'); }
  };

  const handleShare = async (resume, e) => {
    e.stopPropagation();
    try {
      const res = await resumeAPI.toggleShare(resume.id, !resume.is_public);
      const { is_public, share_token } = res.data;
      setResumes(prev => prev.map(r => r.id === resume.id ? { ...r, is_public, share_token } : r));
      if (is_public) {
        setShareModal({ resume: { ...resume, share_token }, token: share_token });
        toast.success('Share link created!');
      } else {
        toast.success('Sharing disabled');
      }
    } catch { toast.error('Failed to toggle sharing'); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this resume permanently?')) return;
    setDeleting(id);
    try {
      await resumeAPI.delete(id);
      setResumes(prev => prev.filter(r => r.id !== id));
      toast.success('Deleted.');
    } catch { toast.error('Failed to delete.'); }
    finally { setDeleting(null); }
  };

  const copyShareLink = (token) => {
    const link = `${window.location.origin}/r/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(token);
    toast.success('Link copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scoreColor = (s) => {
    if (s == null) return 'text-zinc-500 bg-zinc-800/50 border-zinc-700/50';
    if (s >= 70)  return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (s >= 50)  return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return               'text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="animate-[fadeIn_0.3s_ease-out] max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 pt-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Documents</h1>
          <p className="text-zinc-400 text-sm">Manage your ATS-optimized resumes and track job applications.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 pr-5" onClick={() => navigate('/resume/new')}>
          <Plus size={18} /> Create New
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Resumes', val: resumes.length, icon: FileText, color: 'text-zinc-400' },
          { label: 'High Match ≥70%', val: resumes.filter(r => r.ats_score >= 70).length, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'AI Assisted', val: resumes.filter(r => r.is_ai_generated).length, icon: Sparkles, color: 'text-blue-400' },
          { label: 'Applications', val: jobs.length, icon: BarChart3, color: 'text-violet-400' },
        ].map(({ label, val, icon: Icon, color }) => (
          <div key={label} className="glass-panel p-5 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{label}</span>
              <Icon size={16} className={color} />
            </div>
            <div className="text-3xl font-bold text-white">{val}</div>
          </div>
        ))}
      </div>

      {/* Main 3-col grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Resumes — 2.5 cols */}
        <div className="xl:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Resumes</h3>
            <button className="text-sm text-emerald-400 hover:text-emerald-300" onClick={() => navigate('/job-tracker')}>Job Tracker →</button>
          </div>

          {loading ? (
            <div className="glass-panel h-48 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
            </div>
          ) : resumes.length === 0 ? (
            <div className="glass-panel p-16 flex flex-col items-center justify-center text-center border-dashed">
              <FileText size={36} className="text-zinc-700 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No resumes yet</h3>
              <button className="btn-secondary flex items-center gap-2 mt-2" onClick={() => navigate('/resume/new')}>
                <Plus size={16} /> Create Resume
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {resumes.map(resume => (
                <div key={resume.id}
                  className="glass-panel flex flex-col cursor-pointer hover:border-zinc-600 transition-all group overflow-hidden"
                  onClick={() => navigate(`/resume/${resume.id}`)}>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 group-hover:text-white group-hover:bg-zinc-800 transition-colors">
                        <FileText size={18} />
                      </div>
                      <button title="ATS Breakdown" onClick={e => { e.stopPropagation(); setAtsModal(resume); }}
                        className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border flex items-center gap-1 hover:scale-105 transition-transform ${scoreColor(resume.ats_score)}`}>
                        <BarChart3 size={10} /> {resume.ats_score != null ? `${resume.ats_score}%` : 'Analyze'}
                      </button>
                    </div>
                    <h4 className="text-base font-semibold text-zinc-100 mb-1 line-clamp-1 group-hover:text-emerald-400 transition-colors">{resume.title || 'Untitled'}</h4>
                    <p className="text-zinc-500 text-xs mb-4 line-clamp-1">{resume.personal_info?.full_name || '—'}</p>
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {resume.is_ai_generated && (
                        <span className="px-2 py-0.5 rounded border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase"><Sparkles size={9} className="inline mr-1" />AI</span>
                      )}
                      {resume.is_public && (
                        <span className="px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase">Public</span>
                      )}
                      <span className="px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-500 text-[10px]">
                        {new Date(resume.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-zinc-800/80 bg-zinc-900/30 px-3 py-2.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-0.5">
                      <button className="p-1.5 text-zinc-400 hover:text-emerald-400 rounded" title="Edit" onClick={e => { e.stopPropagation(); navigate(`/resume/${resume.id}`); }}><Edit3 size={14} /></button>
                      <button className="p-1.5 text-zinc-400 hover:text-blue-400 rounded" title="Download DOCX" onClick={e => handleDownloadDOCX(resume, e)}><Download size={14} /></button>
                      <button className="p-1.5 text-zinc-400 hover:text-violet-400 rounded" title="PDF View" onClick={e => handleOpenPDF(resume, e)}><FileDown size={14} /></button>
                      <button className="p-1.5 text-zinc-400 hover:text-cyan-400 rounded" title="Clone" onClick={e => handleClone(resume, e)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                      <button className="p-1.5 text-zinc-400 hover:text-amber-400 rounded" title="Share Link" onClick={e => {
                        if (resume.is_public) { setShareModal({ resume, token: resume.share_token }); }
                        else { handleShare(resume, e); }
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                      </button>
                    </div>
                    <button className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded" onClick={e => handleDelete(resume.id, e)} disabled={deleting === resume.id}>
                      {deleting === resume.id ? <div className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Job pipeline chart */}
          {!loading && jobs.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-white mb-4">Job Pipeline</h3>
              <ApplicationsChart jobs={jobs} />
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="xl:col-span-1 space-y-5">
          {!loading && <AchievementsBadges resumes={resumes} jobs={jobs} />}
          {!loading && <ActivityFeed resumes={resumes} />}
        </div>
      </div>

      {/* ATS Modal */}
      {atsModal && <ATSBreakdownModal resume={atsModal} onClose={() => setAtsModal(null)} />}

      {/* Share Modal */}
      {shareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-white font-semibold mb-2">Share Resume</h2>
            <p className="text-zinc-400 text-sm mb-4">Anyone with this link can view your resume without signing in.</p>
            <div className="flex gap-2">
              <input readOnly className="input-glass text-sm flex-1 font-mono text-xs"
                value={`${window.location.origin}/r/${shareModal.token}`} />
              <button onClick={() => copyShareLink(shareModal.token)}
                className="btn-accent px-4 flex items-center gap-2 shrink-0">
                {copiedId === shareModal.token ? <Check size={15} /> : <Copy size={15} />}
              </button>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => { handleShare(shareModal.resume, { stopPropagation: () => {} }); setShareModal(null); }}
                className="btn-secondary flex-1 text-sm text-red-400 border-red-500/20 hover:border-red-500/40">Disable Sharing</button>
              <button onClick={() => setShareModal(null)} className="btn-primary flex-1 text-sm">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
