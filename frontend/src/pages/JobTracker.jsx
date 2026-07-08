import { useState, useEffect, useCallback } from 'react';
import { jobAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Briefcase, Plus, X, ExternalLink, Trash2, ChevronDown,
  Building2, MapPin, DollarSign, Calendar, FileText, GripVertical
} from 'lucide-react';

const COLUMNS = [
  { id: 'wishlist',  label: 'Wishlist',  color: 'text-zinc-400',   border: 'border-zinc-700',    bg: 'bg-zinc-800/40'    },
  { id: 'applied',   label: 'Applied',   color: 'text-blue-400',   border: 'border-blue-500/30', bg: 'bg-blue-500/5'     },
  { id: 'interview', label: 'Interview', color: 'text-amber-400',  border: 'border-amber-500/30',bg: 'bg-amber-500/5'    },
  { id: 'offer',     label: 'Offer',     color: 'text-emerald-400',border: 'border-emerald-500/30',bg: 'bg-emerald-500/5' },
  { id: 'rejected',  label: 'Rejected',  color: 'text-red-400',    border: 'border-red-500/30',  bg: 'bg-red-500/5'      },
];

const EMPTY_FORM = { company: '', job_title: '', status: 'wishlist', job_url: '', salary: '', location: '', applied_date: '', notes: '' };

export default function JobTracker() {
  const [jobs,        setJobs]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [formData,    setFormData]    = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);
  const [dragId,      setDragId]      = useState(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await jobAPI.getAll();
      setJobs(res.data.jobs || []);
    } catch {
      toast.error('Failed to load job applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.company || !formData.job_title) { toast.error('Company and Job Title are required'); return; }
    setSaving(true);
    try {
      const res = await jobAPI.create(formData);
      setJobs(prev => [res.data.job, ...prev]);
      setShowForm(false);
      setFormData(EMPTY_FORM);
      toast.success('Job application added!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add job');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    const prev = jobs.find(j => j.id === jobId);
    setJobs(js => js.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    try {
      await jobAPI.update(jobId, { status: newStatus });
    } catch {
      setJobs(js => js.map(j => j.id === jobId ? { ...j, status: prev.status } : j));
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Delete this job entry?')) return;
    setJobs(js => js.filter(j => j.id !== jobId));
    try {
      await jobAPI.delete(jobId);
      toast.success('Entry deleted');
      if (expandedJob === jobId) setExpandedJob(null);
    } catch {
      toast.error('Failed to delete');
      fetchJobs();
    }
  };

  // Drag-and-drop handlers
  const handleDragStart = (e, jobId) => { setDragId(jobId); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver  = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop      = (e, colId) => { e.preventDefault(); if (dragId) { handleStatusChange(dragId, colId); setDragId(null); } };

  const byStatus = (status) => jobs.filter(j => j.status === status);

  const totalsByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = byStatus(col.id).length;
    return acc;
  }, {});

  return (
    <div className="animate-[fadeIn_0.3s_ease-out] max-w-full mx-auto w-full pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 border-b border-zinc-800 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Briefcase size={28} className="text-emerald-500" />
            Job Tracker
          </h1>
          <p className="text-zinc-400 text-sm max-w-2xl">
            Track every application through your hiring pipeline. Drag cards between columns to update status.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2 pr-5 shrink-0"
        >
          <Plus size={18} /> Add Application
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        {COLUMNS.map(col => (
          <div key={col.id} className={`glass-panel p-4 border ${col.border} ${col.bg}`}>
            <p className={`text-xs font-bold uppercase tracking-widest ${col.color} mb-1`}>{col.label}</p>
            <p className="text-2xl font-bold text-white">{totalsByStatus[col.id]}</p>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="glass-panel h-64 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
          {COLUMNS.map(col => (
            <div
              key={col.id}
              className="flex flex-col gap-3 min-h-[300px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${col.border} ${col.bg}`}>
                <span className={`text-xs font-bold uppercase tracking-widest ${col.color}`}>{col.label}</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${col.color} bg-white/5`}>{totalsByStatus[col.id]}</span>
              </div>

              {/* Cards */}
              {byStatus(col.id).length === 0 ? (
                <div className="border border-dashed border-zinc-800 rounded-xl p-6 text-center text-zinc-600 text-xs">
                  Drop here
                </div>
              ) : (
                byStatus(col.id).map(job => (
                  <div
                    key={job.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, job.id)}
                    className={`glass-panel p-4 cursor-grab active:cursor-grabbing hover:border-zinc-600 transition-all group ${dragId === job.id ? 'opacity-50 scale-95' : ''}`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{job.job_title}</p>
                        <p className="text-zinc-400 text-xs truncate flex items-center gap-1 mt-0.5">
                          <Building2 size={11} /> {job.company}
                        </p>
                      </div>
                      <GripVertical size={14} className="text-zinc-600 shrink-0 mt-0.5" />
                    </div>

                    {/* Meta */}
                    <div className="space-y-1 mb-3">
                      {job.location && (
                        <p className="text-zinc-500 text-xs flex items-center gap-1.5"><MapPin size={10} /> {job.location}</p>
                      )}
                      {job.salary && (
                        <p className="text-zinc-500 text-xs flex items-center gap-1.5"><DollarSign size={10} /> {job.salary}</p>
                      )}
                      {job.applied_date && (
                        <p className="text-zinc-500 text-xs flex items-center gap-1.5"><Calendar size={10} /> {job.applied_date}</p>
                      )}
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center gap-1 pt-3 border-t border-zinc-800/60">
                      {job.job_url && (
                        <a
                          href={job.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded text-zinc-500 hover:text-blue-400 transition-colors"
                          title="Open job posting"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                      {job.notes && (
                        <button
                          onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                          className="p-1.5 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
                          title="View notes"
                        >
                          <FileText size={13} />
                        </button>
                      )}
                      {/* Status quick-change */}
                      <div className="relative ml-auto">
                        <select
                          value={job.status}
                          onChange={(e) => handleStatusChange(job.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-bold uppercase bg-zinc-900 border border-zinc-700 rounded px-1.5 py-1 text-zinc-400 cursor-pointer appearance-none pr-4"
                        >
                          {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                        <ChevronDown size={9} className="absolute right-1 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(job.id); }}
                        className="p-1.5 rounded text-zinc-600 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Expanded notes */}
                    {expandedJob === job.id && job.notes && (
                      <div className="mt-3 pt-3 border-t border-zinc-800/60 animate-[fadeIn_0.2s_ease-out]">
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Notes</p>
                        <p className="text-xs text-zinc-400 leading-relaxed">{job.notes}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Job Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-white font-semibold flex items-center gap-2"><Plus size={18} className="text-emerald-500" /> Add Job Application</h2>
              <button onClick={() => setShowForm(false)} className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-glass">Job Title *</label>
                  <input className="input-glass text-sm" value={formData.job_title} onChange={e => setFormData({...formData, job_title: e.target.value})} placeholder="Software Engineer" required />
                </div>
                <div>
                  <label className="label-glass">Company *</label>
                  <input className="input-glass text-sm" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="Google" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-glass">Status</label>
                  <select className="input-glass text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-glass">Date Applied</label>
                  <input type="date" className="input-glass text-sm" value={formData.applied_date} onChange={e => setFormData({...formData, applied_date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="label-glass">Job URL</label>
                <input type="url" className="input-glass text-sm" value={formData.job_url} onChange={e => setFormData({...formData, job_url: e.target.value})} placeholder="https://jobs.company.com/..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-glass">Location</label>
                  <input className="input-glass text-sm" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Remote / Kathmandu" />
                </div>
                <div>
                  <label className="label-glass">Salary Range</label>
                  <input className="input-glass text-sm" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} placeholder="$80k – $100k" />
                </div>
              </div>
              <div>
                <label className="label-glass">Notes</label>
                <textarea className="input-glass text-sm resize-none" rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Recruiter name, next steps, interview date..." />
              </div>
              <button type="submit" disabled={saving} className="btn-accent w-full flex items-center justify-center gap-2">
                {saving ? <><div className="w-4 h-4 border-2 border-emerald-950/30 border-t-emerald-950 rounded-full animate-spin" /> Saving...</> : <><Plus size={16} /> Add Application</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
