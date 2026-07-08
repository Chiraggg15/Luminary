import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { resumeAPI } from '../services/api';
import { FileText, MapPin, Mail, Phone, Globe, Linkedin, Github } from 'lucide-react';

/**
 * PublicResume — no auth required
 * Renders a clean, read-only resume from a share token URL
 */
export default function PublicResume() {
  const { token } = useParams();
  const [resume, setResume]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    resumeAPI.getPublic(token)
      .then(res => setResume(res.data.resume))
      .catch(() => setError('This resume is not available or sharing has been disabled.'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-4">
        <FileText size={28} className="text-zinc-600" />
      </div>
      <h1 className="text-white text-xl font-semibold mb-2">Resume Unavailable</h1>
      <p className="text-zinc-400 text-sm max-w-sm">{error}</p>
      <a href="/" className="mt-6 btn-accent px-6 py-2 rounded-lg text-sm font-semibold inline-block">
        Build Your Own Resume →
      </a>
    </div>
  );

  const pi = resume?.personal_info || {};
  const skills = resume?.skills || {};

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Top bar */}
      <div className="bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-emerald-500 flex items-center justify-center text-zinc-950 font-bold text-sm">L</div>
          <span className="text-white font-semibold text-sm">Luminary</span>
        </div>
        <span className="text-zinc-500 text-xs">Public Resume</span>
        <a href="/register" className="btn-accent px-4 py-1.5 text-xs rounded-lg font-semibold">Create Yours Free →</a>
      </div>

      {/* Resume content */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-zinc-900 px-8 py-8">
            <h1 className="text-3xl font-bold text-white mb-1">{pi.full_name || 'Resume'}</h1>
            <div className="flex flex-wrap gap-4 mt-3 text-zinc-400 text-sm">
              {pi.email    && <span className="flex items-center gap-1.5"><Mail size={13}/>{pi.email}</span>}
              {pi.phone    && <span className="flex items-center gap-1.5"><Phone size={13}/>{pi.phone}</span>}
              {pi.location && <span className="flex items-center gap-1.5"><MapPin size={13}/>{pi.location}</span>}
              {pi.linkedin && <span className="flex items-center gap-1.5"><Linkedin size={13}/>{pi.linkedin}</span>}
              {pi.github   && <span className="flex items-center gap-1.5"><Github size={13}/>{pi.github}</span>}
              {pi.portfolio && <span className="flex items-center gap-1.5"><Globe size={13}/>{pi.portfolio}</span>}
            </div>
          </div>

          <div className="px-8 py-8 space-y-8 font-serif">
            {/* Summary */}
            {pi.summary && (
              <section>
                <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-200 pb-2 mb-3">Professional Summary</h2>
                <p className="text-zinc-700 text-sm leading-relaxed">{pi.summary}</p>
              </section>
            )}

            {/* Experience */}
            {resume?.experience?.length > 0 && (
              <section>
                <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-200 pb-2 mb-4">Experience</h2>
                <div className="space-y-5">
                  {resume.experience.map((exp, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-sans font-bold text-zinc-800">{exp.position}</h3>
                          <p className="text-zinc-600 text-sm">{exp.company}</p>
                        </div>
                        <span className="text-xs text-zinc-500 font-sans">{exp.start_date} – {exp.end_date || 'Present'}</span>
                      </div>
                      {exp.description && (
                        <div className="mt-2 text-sm text-zinc-600 leading-relaxed">
                          {exp.description.split('\n').filter(Boolean).map((line, j) => (
                            <div key={j} className="flex gap-2"><span>•</span><span>{line.replace(/^[-•]\s*/, '')}</span></div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {resume?.education?.length > 0 && (
              <section>
                <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-200 pb-2 mb-4">Education</h2>
                {resume.education.map((edu, i) => (
                  <div key={i} className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-sans font-bold text-zinc-800">{edu.institution}</h3>
                      <p className="text-zinc-600 text-sm">{edu.degree} in {edu.field_of_study}{edu.grade ? ` · ${edu.grade}` : ''}</p>
                    </div>
                    <span className="text-xs text-zinc-500 font-sans">{edu.start_date} – {edu.end_date}</span>
                  </div>
                ))}
              </section>
            )}

            {/* Skills */}
            {(skills.technical?.length > 0 || skills.soft?.length > 0) && (
              <section>
                <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-200 pb-2 mb-3">Skills</h2>
                {skills.technical?.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-sans font-bold text-zinc-500 uppercase mr-2">Technical:</span>
                    <span className="text-sm text-zinc-700">{skills.technical.join(', ')}</span>
                  </div>
                )}
                {skills.soft?.length > 0 && (
                  <div>
                    <span className="text-xs font-sans font-bold text-zinc-500 uppercase mr-2">Soft Skills:</span>
                    <span className="text-sm text-zinc-700">{skills.soft.join(', ')}</span>
                  </div>
                )}
              </section>
            )}

            {/* Projects */}
            {resume?.projects?.length > 0 && (
              <section>
                <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-200 pb-2 mb-4">Projects</h2>
                {resume.projects.map((p, i) => (
                  <div key={i} className="mb-4">
                    <h3 className="font-sans font-bold text-zinc-800">{p.name}</h3>
                    <p className="text-zinc-600 text-sm mt-1">{p.description}</p>
                    {p.technologies?.length > 0 && (
                      <p className="text-xs text-zinc-500 mt-1 font-sans">Tech: {p.technologies.join(', ')}</p>
                    )}
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-8">
          <p className="text-zinc-500 text-sm mb-3">Built with Luminary AI Resume Builder</p>
          <a href="/register" className="inline-flex items-center gap-2 bg-emerald-500 text-zinc-950 font-bold px-6 py-2.5 rounded-xl hover:bg-emerald-400 transition-colors">
            Create Your Free Resume →
          </a>
        </div>
      </div>
    </div>
  );
}
