import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Briefcase, GraduationCap, Wrench, Sparkles, Eye, Save, Plus, Trash2, ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { resumeAPI, aiAPI } from '../services/api';

const STEPS = [
  { id: 0, label: 'Personal',    icon: User         },
  { id: 1, label: 'Experience',  icon: Briefcase    },
  { id: 2, label: 'Education',   icon: GraduationCap},
  { id: 3, label: 'Skills',      icon: Wrench       },
  { id: 4, label: 'AI Scanner',  icon: Activity     },
  { id: 5, label: 'Preview',     icon: Eye          },
];

const EMPTY_RESUME = {
  title: 'My Resume',
  template: 'modern',
  personal_info: { full_name: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '', summary: '' },
  experience: [],
  education: [],
  skills: { technical: [], soft: [] },
  projects: [], certifications: [], languages: [],
};

const EMPTY_EXP = { company: '', position: '', start_date: '', end_date: '', description: '', is_current: false };
const EMPTY_EDU = { institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', grade: '' };

export default function ResumeBuilder() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const isEditing = !!id;

  const [step, setStep]           = useState(0);
  const [resume, setResume]       = useState(EMPTY_RESUME);
  const [saving, setSaving]       = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [resumeId, setResumeId]   = useState(id || null);

  const [aiForm, setAiForm] = useState({ job_title: '', skills: '', experience_years: 0, industry: 'Technology', job_description: '', resume_text: '' });
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (!isEditing) return;
    resumeAPI.getById(id)
      .then(res => setResume({ ...EMPTY_RESUME, ...res.data }))
      .catch(() => { toast.error('Resume not found'); navigate('/dashboard'); });
  }, [id, isEditing, navigate]);

  const updatePersonal = (field, value) => setResume(r => ({ ...r, personal_info: { ...r.personal_info, [field]: value } }));

  const updateExp = (idx, field, value) => setResume(r => {
    const exp = [...r.experience];
    exp[idx] = { ...exp[idx], [field]: field === 'is_current' ? value : value };
    if (field === 'is_current' && value) exp[idx].end_date = 'Present';
    return { ...r, experience: exp };
  });

  const addExp    = () => setResume(r => ({ ...r, experience: [...r.experience, { ...EMPTY_EXP }] }));
  const removeExp = (i) => setResume(r => ({ ...r, experience: r.experience.filter((_, idx) => idx !== i) }));

  const updateEdu = (idx, field, value) => setResume(r => { const e=[...r.education]; e[idx]={...e[idx],[field]:value}; return{...r,education:e}; });
  const addEdu    = () => setResume(r => ({ ...r, education: [...r.education, { ...EMPTY_EDU }] }));
  const removeEdu = (i) => setResume(r => ({ ...r, education: r.education.filter((_,idx)=>idx!==i) }));

  const updateSkillsStr = (type, value) => setResume(r => ({ ...r, skills: { ...r.skills, [type]: value.split(',').map(s => s.trim()).filter(Boolean) } }));

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      if (resumeId) {
        await resumeAPI.update(resumeId, resume);
        toast.success('Document saved successfully.');
      } else {
        const res = await resumeAPI.create(resume);
        setResumeId(res.data.resume.id);
        toast.success('Document created successfully.');
      }
    } catch {
      toast.error('Could not save document');
    } finally {
      setSaving(false);
    }
  }, [resume, resumeId]);

  const handleAIGenerate = async () => {
    if (!aiForm.job_title) return toast.error('Target Role is required');
    setAiLoading(true);
    try {
      const res = await aiAPI.generateResume({
        job_title: aiForm.job_title,
        skills: aiForm.skills.split(',').map(s => s.trim()).filter(Boolean),
        experience_years: Number(aiForm.experience_years),
        industry: aiForm.industry,
      });
      const gen = res.data.generated;
      setResume(r => ({
        ...r,
        personal_info: { ...r.personal_info, summary: gen.summary },
        skills: { ...r.skills, technical: [...new Set([...r.skills.technical, ...gen.suggested_skills])] },
      }));
      toast.success('AI generation complete. Content merged.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Intelligence failure');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!aiForm.job_description) return toast.error('Paste a job description first');
    setAiLoading(true);
    try {
      const text = [
        resume.personal_info.summary,
        resume.experience.map(e => `${e.position} at ${e.company}\n${e.description}`).join('\n'),
        resume.skills.technical.join(', '),
      ].join('\n\n');

      const res = await aiAPI.analyzeResume({ resume_text: text, job_description: aiForm.job_description });
      setAnalysis(res.data.analysis);
      toast.success(`Analysis complete: ${res.data.analysis.ats_score}% Match`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed');
    } finally {
      setAiLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div className="animate-[fadeIn_0.3s_ease-out]">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-1">Personal Profile</h3>
            <p className="text-zinc-400 text-sm">Core identity and contact details for recruiter outreach.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              ['full_name','Full Name','John Doe'],['email','Work Email','john@company.com'],
              ['phone','Phone Number','+1 (555) 000-0000'],['location','Location','San Francisco, CA'],
              ['linkedin','LinkedIn URL','linkedin.com/in/johndoe'],['github','GitHub/Portfolio','github.com/johndoe'],
            ].map(([field, label, placeholder]) => (
              <div key={field}>
                <label className="label-glass">{label}</label>
                <input type="text" className="input-glass" placeholder={placeholder} value={resume.personal_info[field] || ''} onChange={e => updatePersonal(field, e.target.value)} />
              </div>
            ))}
            <div className="md:col-span-2 mt-2">
              <label className="label-glass">Executive Summary</label>
              <textarea className="input-glass resize-y" placeholder="Summarize your career highlights and direct value to the employer..." value={resume.personal_info.summary || ''} onChange={e => updatePersonal('summary', e.target.value)} rows={4} />
            </div>
          </div>
        </div>
      );

      case 1: return (
        <div className="animate-[fadeIn_0.3s_ease-out]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Professional Experience</h3>
              <p className="text-zinc-400 text-sm">Quantify your achievements using bullet points.</p>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-sm text-zinc-300 font-medium transition-colors" onClick={addExp}>
              <Plus size={16}/> Add Position
            </button>
          </div>
          {resume.experience.length === 0 ? (
            <div className="glass-panel py-16 text-center border-dashed border-zinc-800">
              <Briefcase size={32} className="mx-auto mb-3 text-zinc-600" />
              <p className="text-zinc-400 text-sm">No employment history added.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {resume.experience.map((exp, i) => (
                <div key={i} className="glass-panel p-6 border-zinc-800 group">
                  <div className="flex justify-between items-center mb-5 pb-4 border-b border-zinc-800/80">
                    <span className="text-xs font-bold tracking-widest uppercase text-zinc-500">Position 0{i + 1}</span>
                    <button className="text-zinc-500 hover:text-red-400 transition-colors" onClick={() => removeExp(i)}><Trash2 size={16}/></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[['company','Company','Google'],['position','Job Title','Senior Engineer']].map(([f,l,p]) => (
                      <div key={f}><label className="label-glass">{l}</label><input className="input-glass" placeholder={p} value={exp[f]||''} onChange={e=>updateExp(i,f,e.target.value)}/></div>
                    ))}
                    <div>
                      <label className="label-glass">Start Date</label>
                      <input className="input-glass" type="month" value={exp.start_date||''} onChange={e=>updateExp(i,'start_date',e.target.value)}/>
                    </div>
                    <div>
                      <label className="label-glass">End Date</label>
                      <input className="input-glass disabled:opacity-50 disabled:bg-zinc-900" type={exp.is_current?'text':'month'} disabled={exp.is_current} value={exp.is_current?'Present':exp.end_date||''} onChange={e=>updateExp(i,'end_date',e.target.value)}/>
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-3 text-sm font-medium text-zinc-400 cursor-pointer w-max">
                        <input type="checkbox" className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-emerald-500 focus:ring-emerald-500" checked={exp.is_current||false} onChange={e=>updateExp(i,'is_current',e.target.checked)}/>
                        I currently work here
                      </label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="label-glass">Bullet Points</label>
                      <textarea className="input-glass resize-y" rows={4} placeholder={`• Architected scalable microservices...\n• Reduced latency by 45%...\n• Mentored junior developers...`} value={exp.description||''} onChange={e=>updateExp(i,'description',e.target.value)}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

      case 2: return (
        <div className="animate-[fadeIn_0.3s_ease-out]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Academic Background</h3>
              <p className="text-zinc-400 text-sm">Degrees, bootcamp certifications, and academic standing.</p>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-sm text-zinc-300 font-medium transition-colors" onClick={addEdu}>
              <Plus size={16}/> Add Degree
            </button>
          </div>
          {resume.education.length === 0 ? (
            <div className="glass-panel py-16 text-center border-dashed border-zinc-800">
              <GraduationCap size={32} className="mx-auto mb-3 text-zinc-600" />
              <p className="text-zinc-400 text-sm">No education records added.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {resume.education.map((edu, i) => (
                <div key={i} className="glass-panel p-6 border-zinc-800">
                  <div className="flex justify-between items-center mb-5 pb-4 border-b border-zinc-800/80">
                    <span className="text-xs font-bold tracking-widest uppercase text-zinc-500">Record 0{i+1}</span>
                    <button className="text-zinc-500 hover:text-red-400 transition-colors" onClick={() => removeEdu(i)}><Trash2 size={16}/></button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                      ['institution','Institution','MIT'],
                      ['degree','Degree Level','B.S.'],
                      ['field_of_study','Major / Field','Computer Science'],
                      ['grade','GPA (Optional)','3.9'],
                    ].map(([f,l,p]) => (
                      <div key={f}><label className="label-glass">{l}</label><input className="input-glass" placeholder={p} value={edu[f]||''} onChange={e=>updateEdu(i,f,e.target.value)}/></div>
                    ))}
                    <div><label className="label-glass">Start Date</label><input className="input-glass" type="month" value={edu.start_date||''} onChange={e=>updateEdu(i,'start_date',e.target.value)}/></div>
                    <div><label className="label-glass">Graduation</label><input className="input-glass" type="month" value={edu.end_date||''} onChange={e=>updateEdu(i,'end_date',e.target.value)}/></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

      case 3: return (
        <div className="animate-[fadeIn_0.3s_ease-out]">
          <h3 className="text-xl font-bold text-white mb-1">Keywords & Competencies</h3>
          <p className="text-zinc-400 text-sm mb-6">Separate tags with commas. These are critical for ATS parsing.</p>
          <div className="space-y-6">
            <div>
              <label className="label-glass">Technical Proficiency</label>
              <textarea className="input-glass resize-y" rows={3} placeholder="React, Kubernetes, PostgreSQL, TypeScript..." value={resume.skills.technical.join(', ')} onChange={e => updateSkillsStr('technical', e.target.value)}/>
              <div className="flex flex-wrap gap-2 mt-3">
                {resume.skills.technical.map(s => <span key={s} className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-300 bg-zinc-800 rounded border border-zinc-700">{s}</span>)}
              </div>
            </div>
            <div>
              <label className="label-glass">Soft Skills</label>
              <textarea className="input-glass resize-y" rows={2} placeholder="Agile Leadership, Cross-functional Communication..." value={resume.skills.soft.join(', ')} onChange={e => updateSkillsStr('soft', e.target.value)}/>
              <div className="flex flex-wrap gap-2 mt-3">
                {resume.skills.soft.map(s => <span key={s} className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-900 rounded border border-zinc-800">{s}</span>)}
              </div>
            </div>
            <div className="pt-6 border-t border-zinc-800 mt-8">
              <label className="label-glass">Document Name (Internal)</label>
              <input className="input-glass w-full md:w-1/2" placeholder="e.g. Senior Frontend Resume 2024" value={resume.title} onChange={e => setResume(r => ({ ...r, title: e.target.value }))}/>
            </div>
          </div>
        </div>
      );

      case 4: return (
        <div className="animate-[fadeIn_0.3s_ease-out] grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="glass-panel p-6 border-zinc-800 col-span-1 lg:col-span-2 shadow-sm mb-2">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><Sparkles size={18} className="text-emerald-500" /> AI Optimization Engine</h3>
            <p className="text-zinc-400 text-sm">Automatically draft your professional summary and extrapolate core technical skills based on your profile blueprint.</p>
            <div className="mt-6 flex flex-wrap sm:flex-nowrap gap-4 items-end">
              <div className="w-full sm:w-2/3">
                <label className="label-glass">Target Role</label>
                <input className="input-glass text-sm" placeholder="e.g. Lead Software Engineer" value={aiForm.job_title} onChange={e=>setAiForm(f=>({...f,job_title:e.target.value}))}/>
              </div>
              <button className="btn-secondary w-full sm:w-1/3 flex justify-center gap-2 items-center text-sm" onClick={handleAIGenerate} disabled={aiLoading}>
                {aiLoading ? <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"/> : <Sparkles size={16}/>}
                Compile Content
              </button>
            </div>
          </div>

          <div className="glass-panel p-6 border-zinc-800 col-span-1 lg:col-span-2 group">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2"><Activity size={18} className="text-blue-500"/> PostJob ATS Scanner</h3>
            <p className="text-zinc-400 text-sm mb-5">Compare your current resume payload against a live job description to verify structural and keyword integrity.</p>
            
            <label className="label-glass text-xs uppercase tracking-widest text-zinc-500">Job Description Log</label>
            <textarea className="input-glass mt-1 resize-y text-sm font-serif" rows={4} placeholder="Paste raw job description block here..." value={aiForm.job_description} onChange={e => setAiForm(f => ({ ...f, job_description: e.target.value }))}/>
            
            <button className="btn-primary w-full mt-4 flex items-center justify-center gap-2 text-sm" onClick={handleAnalyze} disabled={aiLoading}>
              {aiLoading ? <div className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"/> : 'EXECUTE SCAN'}
            </button>

            {analysis && (
              <div className="mt-8 pt-8 border-t border-zinc-800 animate-[fadeIn_0.4s_ease-out]">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  <div className="w-32 h-32 rounded-full border-[6px] flex items-center justify-center flex-col shrink-0" style={{borderColor: analysis.ats_score>=70?'#10b981':analysis.ats_score>=50?'#f59e0b':'#ef4444'}}>
                    <span className="text-3xl font-bold text-white leading-none">{analysis.ats_score}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Match</span>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">Verified Matches</h5>
                      <div className="flex flex-wrap gap-1.5">{analysis.matched_keywords.map(k=><span key={k} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-xs border border-emerald-500/20">{k}</span>)}</div>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">Missing Capabilities</h5>
                      <div className="flex flex-wrap gap-1.5">{analysis.missing_keywords.map(k=><span key={k} className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-xs border border-red-500/20">{k}</span>)}</div>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">AI Diagnostics</h5>
                      <ul className="text-sm text-zinc-400 space-y-1 list-disc list-inside bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">{analysis.suggestions.map((s,i)=><li key={i}>{s}</li>)}</ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );

      case 5: return (
        <div className="animate-[fadeIn_0.3s_ease-out]">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Final render</h3>
              <p className="text-zinc-400 text-sm">Review your compiled document before distribution.</p>
            </div>
          </div>
          <div className="bg-white text-zinc-900 rounded-sm p-8 max-w-4xl mx-auto shadow-2xl min-h-[850px] font-sans border-t-[16px] border-zinc-900">
            <div className="mb-6 pb-6 border-b border-zinc-200">
              <h1 className="text-4xl font-extrabold text-zinc-950 uppercase tracking-tighter mb-2">{resume.personal_info.full_name || 'JOHN DOE'}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-600 font-medium">
                {resume.personal_info.email && <span>{resume.personal_info.email}</span>}
                {resume.personal_info.phone && <span>• {resume.personal_info.phone}</span>}
                {resume.personal_info.location && <span>• {resume.personal_info.location}</span>}
              </div>
            </div>
            {resume.personal_info.summary && (
              <section className="mb-6">
                <p className="text-[14px] text-zinc-700 leading-relaxed max-w-3xl">{resume.personal_info.summary}</p>
              </section>
            )}
            {resume.experience.length>0 && (
              <section className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 border-b border-zinc-200 pb-2">Experience</h4>
                <div className="space-y-6">
                  {resume.experience.map((e,i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline mb-0.5">
                        <strong className="text-zinc-900 text-[15px]">{e.position}</strong>
                        <span className="text-[13px] text-zinc-500 font-semibold uppercase tracking-wider">{e.start_date} — {e.end_date || 'Present'}</span>
                      </div>
                      <div className="text-[14px] text-emerald-700 font-semibold mb-2">{e.company}</div>
                      <div className="text-[14px] text-zinc-700 leading-relaxed whitespace-pre-line ml-4 shadow-[inset_2px_0_0_#e4e4e7] pl-4">{e.description}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {resume.education.length>0 && (
              <section className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 border-b border-zinc-200 pb-2">Education</h4>
                <div className="space-y-4">
                  {resume.education.map((e,i) => (
                    <div key={i} className="flex justify-between items-baseline">
                      <div>
                        <strong className="text-zinc-900 block text-[15px]">{e.institution}</strong>
                        <span className="text-[14px] text-zinc-600">{e.degree} in {e.field_of_study} {e.grade && `· ${e.grade}`}</span>
                      </div>
                      <span className="text-[13px] text-zinc-500 font-semibold uppercase tracking-wider">{e.start_date} — {e.end_date}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {(resume.skills.technical.length>0 || resume.skills.soft.length>0) && (
              <section>
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 border-b border-zinc-200 pb-2">Skills Matrix</h4>
                <div className="space-y-2 text-[14px]">
                  {resume.skills.technical.length>0 && <div className="text-zinc-700"><strong className="text-zinc-900 mr-2">Technical:</strong> {resume.skills.technical.join(', ')}</div>}
                  {resume.skills.soft.length>0 && <div className="text-zinc-700"><strong className="text-zinc-900 mr-2">Core:</strong> {resume.skills.soft.join(', ')}</div>}
                </div>
              </section>
            )}
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-2 animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button className="p-2 text-zinc-500 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-800" onClick={() => navigate('/dashboard')} title="Back to Dashboard">
            <ArrowLeft size={18}/>
          </button>
          <h2 className="text-2xl font-bold text-white tracking-tight">{isEditing ? 'Configuring Profile' : 'New Configuration'}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary text-sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Step Indicator Sidebar */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="glass-panel p-4 sticky top-24 border-zinc-800/80">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 ml-2">Progress</h4>
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto no-scrollbar">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const done = i < step;
                const active = i === step;
                return (
                  <button
                    key={s.id}
                    className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all font-medium text-sm text-left min-w-max lg:min-w-0 ${
                      active ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700' :
                      done ? 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-300' : 'text-zinc-600 hover:text-zinc-400'
                    }`}
                    onClick={() => setStep(i)}
                  >
                    <div className={`shrink-0 ${active ? 'text-emerald-400' : done ? 'text-emerald-600' : 'text-zinc-700'}`}>
                      {done && !active ? <CheckCircle2 size={16}/> : <Icon size={16}/>}
                    </div>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Content Area */}
        <div className="flex-1 w-full flex flex-col min-h-[600px]">
          <div className="glass-panel flex-1 p-6 md:p-8 border-zinc-800 mb-6 bg-zinc-950/50">
            {renderStep()}
          </div>

          {/* Pagination Navigation */}
          <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 backdrop-blur-sm">
            <button
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-300 font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              onClick={() => setStep(s => Math.max(0, s-1))} disabled={step === 0}
            >
              <ArrowLeft size={16}/> Previous
            </button>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">{step + 1} / {STEPS.length} Steps</span>
            {step < STEPS.length - 1 ? (
              <button className="btn-primary px-8 py-2.5 flex items-center gap-2 text-sm" onClick={() => setStep(s => s+1)}>
                Next Step <ChevronRight size={16}/>
              </button>
            ) : (
              <button className="btn-accent px-8 py-2.5 flex items-center gap-2 text-sm" onClick={handleSave} disabled={saving}>
                {saving ? <div className="w-4 h-4 border-2 border-emerald-900/30 border-t-emerald-950 rounded-full animate-spin"/> : <Save size={16}/>}
                Compile & Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
