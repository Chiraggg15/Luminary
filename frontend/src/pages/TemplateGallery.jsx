import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Filter, Search, Crown } from 'lucide-react';
import TemplateCard from '../components/templates/TemplateCard';
import TemplatePreviewModal from '../components/templates/TemplatePreviewModal';
import api from '../services/api';
import toast from 'react-hot-toast';

// Dummy data for users without resumes
const DUMMY_RESUME_DATA = {
  contact: {
    name: "Chirag Lama",
    email: "chirag.lama@example.com",
    phone: "+1 234 567 8900",
    location: "New York, NY",
    linkedin: "linkedin.com/in/alexdoe",
    github: "github.com/alexdoe"
  },
  summary: "Results-driven professional with 5+ years of experience in creating scalable web applications and leading cross-functional teams to deliver high-quality software on time and within budget.",
  experience: [
    {
      title: "Senior Software Engineer",
      company: "Tech Corp",
      location: "New York, NY",
      startDate: "Jan 2021",
      endDate: "Present",
      bullets: [
        "Led a team of 5 engineers to rebuild the core platform architecture.",
        "Improved application performance by 40% using modern web technologies.",
        "Implemented CI/CD pipelines reducing deployment time by 60%."
      ]
    },
    {
      title: "Software Developer",
      company: "Web Solutions Inc.",
      location: "Austin, TX",
      startDate: "Jun 2018",
      endDate: "Dec 2020",
      bullets: [
        "Developed and maintained responsive user interfaces using React and Redux.",
        "Collaborated with UX designers to implement pixel-perfect designs.",
        "Wrote comprehensive unit and integration tests."
      ]
    }
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "State University",
      year: "2018",
      gpa: "3.8"
    }
  ],
  skills: {
    technical: ["JavaScript", "React", "Node.js", "Python", "SQL", "AWS"],
    soft: ["Leadership", "Communication", "Problem Solving"]
  },
  projects: [
    {
      name: "E-Commerce Platform",
      description: "Built a full-stack e-commerce platform processing $10k+ monthly sales.",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"]
    }
  ],
  certifications: [
    {
      name: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      year: "2022"
    }
  ]
};

// Helper function to map backend resume format to standard frontend format
const mapResumeData = (backendResume) => {
  if (!backendResume) return DUMMY_RESUME_DATA;
  
  let fullName = backendResume.personal_info?.full_name || DUMMY_RESUME_DATA.contact.name;
  if (fullName === "Kirtan Joshi") fullName = "Chirag Lama"; // Override based on request
  
  return {
    contact: {
      name: fullName,
      email: backendResume.personal_info?.email || DUMMY_RESUME_DATA.contact.email,
      phone: backendResume.personal_info?.phone || DUMMY_RESUME_DATA.contact.phone,
      location: backendResume.personal_info?.location || DUMMY_RESUME_DATA.contact.location,
      linkedin: backendResume.personal_info?.linkedin || "",
      github: backendResume.personal_info?.github || "",
      portfolio: backendResume.personal_info?.portfolio || ""
    },
    summary: backendResume.personal_info?.summary || DUMMY_RESUME_DATA.summary,
    experience: (backendResume.experience || []).map(exp => ({
      title: exp.position,
      company: exp.company,
      location: exp.location || "",
      startDate: exp.start_date,
      endDate: exp.is_current ? "Present" : exp.end_date,
      bullets: exp.description ? exp.description.split('\n').filter(Boolean) : []
    })),
    education: (backendResume.education || []).map(edu => ({
      degree: edu.degree,
      institution: edu.institution,
      year: edu.end_date || edu.start_date || "",
      gpa: edu.grade || ""
    })),
    skills: {
      technical: backendResume.skills?.technical || [],
      soft: backendResume.skills?.soft || []
    },
    projects: (backendResume.projects || []).map(proj => ({
      name: proj.name,
      description: proj.description,
      technologies: proj.technologies || []
    })),
    certifications: (backendResume.certifications || []).map(cert => ({
      name: cert.name,
      issuer: cert.issuer,
      year: cert.date
    }))
  };
};

const TemplateGallery = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [user, setUser] = useState(null);
  const [userResumes, setUserResumes] = useState([]);
  const [activeResume, setActiveResume] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filterTier, setFilterTier] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [previewTemplate, setPreviewTemplate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [templatesRes, userRes, resumesRes] = await Promise.all([
          api.get('/templates/'),
          api.get('/auth/me'),
          api.get('/resume/')
        ]);
        
        setTemplates(templatesRes.data.templates);
        setUser(userRes.data);
        setUserResumes(resumesRes.data.resumes || []);
        
        if (resumesRes.data.resumes && resumesRes.data.resumes.length > 0) {
          setActiveResume(resumesRes.data.resumes[0]); // Use most recent by default
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load templates");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredTemplates = templates.filter(t => {
    const matchesTier = filterTier === 'all' || t.tier === filterTier;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  const handleApplySuccess = (appliedResumeId) => {
    const targetId = appliedResumeId || activeResume?.id;
    if (targetId) {
      toast.success("Template applied! Opening resume editor...");
      navigate(`/resume/${targetId}`);
    } else {
      toast.success("Template applied successfully!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const isPremiumUser = user?.is_premium || false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-emerald-500" />
          Template Gallery
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-medium">
          Choose a professionally designed template to make your resume stand out. 
          All templates are ATS-friendly.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-zinc-900/50 p-4 rounded-xl shadow-sm border border-zinc-800 backdrop-blur-sm">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-5 h-5 text-zinc-400" />
          <select 
            className="border-none bg-zinc-800 text-zinc-200 rounded-lg py-2 px-4 focus:ring-2 focus:ring-emerald-500 cursor-pointer outline-none"
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
          >
            <option value="all">All Templates</option>
            <option value="free">Free Only</option>
          </select>
        </div>

        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder="Search templates..."
            className="block w-full pl-10 pr-3 py-2 border border-zinc-700 rounded-lg leading-5 bg-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Resume Selection for Preview */}
      {userResumes.length > 0 && (
        <div className="mb-8 flex items-center gap-3 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 text-emerald-400">
          <span className="font-semibold text-sm">Previewing with data from:</span>
          <select 
            className="border border-emerald-500/30 bg-zinc-900 text-zinc-200 text-sm rounded-md py-1.5 px-3 focus:ring-2 focus:ring-emerald-500 outline-none"
            value={activeResume?.id || ''}
            onChange={(e) => setActiveResume(userResumes.find(r => r.id === e.target.value))}
          >
            {userResumes.map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTemplates.map(template => (
          <TemplateCard 
            key={template.id} 
            template={template} 
            isPremiumUser={isPremiumUser}
            onSelect={setPreviewTemplate}
            resumeData={mapResumeData(activeResume)}
          />
        ))}
      </div>
      
      {filteredTemplates.length === 0 && (
        <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-700">
          <div className="text-zinc-600 mb-2 text-6xl">🔍</div>
          <h3 className="text-lg font-medium text-white">No templates found</h3>
          <p className="text-zinc-400 mt-1">Try adjusting your filters or search query.</p>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal 
          template={previewTemplate}
          resumeData={mapResumeData(activeResume)}
          resumeId={activeResume?.id}
          onClose={() => setPreviewTemplate(null)}
          onApplySuccess={handleApplySuccess}
        />
      )}
    </div>
  );
};

export default TemplateGallery;
