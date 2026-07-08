import React, { useState } from 'react';
import { X, Check, Download } from 'lucide-react';
import TemplateCustomizer from './TemplateCustomizer';
import TemplateRenderer from './TemplateRenderer';
import api, { resumeAPI } from '../../services/api';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const TemplatePreviewModal = ({ template, resumeData, resumeId, onClose, onApplySuccess }) => {
  const [customizations, setCustomizations] = useState({
    accentColor: template.accentColorDefault,
    fontFamily: template.id === 'ats-maximizer' ? 'Arial, sans-serif' : 'Inter, sans-serif'
  });
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      if (!resumeId) {
        // Create new resume first if they don't have one yet
        const newResume = {
          title: `My ${template.name} Resume`,
          template: {
            id: template.id,
            customizations: customizations,
            appliedAt: new Date().toISOString()
          },
          personal_info: { full_name: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '', summary: '' },
          experience: [],
          education: [],
          skills: { technical: [], soft: [] },
          projects: [],
          certifications: [],
          languages: []
        };
        
        const res = await resumeAPI.create(newResume);
        const newId = res.data.resume.id || res.data.resume._id;
        toast.success('New resume created with template!');
        if (onApplySuccess) onApplySuccess(newId);
        onClose();
      } else {
        await api.post('/templates/apply', {
          resume_id: resumeId,
          template_id: template.id,
          customizations: customizations
        });
        toast.success('Template applied successfully!');
        if (onApplySuccess) onApplySuccess(resumeId);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to apply template');
    } finally {
      setIsApplying(false);
    }
  };

  const handleDownloadPreview = async () => {
    const toastId = toast.loading('Generating PDF...');
    try {
      const element = document.getElementById('cv-preview-container')?.firstElementChild;
      if (!element) throw new Error("Preview element not found");
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      pdf.save(`${resumeData?.contact?.name || 'resume'}_premium_template.pdf`);
      toast.success('PDF Downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF', { id: toastId });
    }
  };

  if (!template) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-gray-900/80 backdrop-blur-sm overflow-hidden animate-fade-in">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-zinc-950 border-b border-zinc-800 px-6 flex items-center justify-between z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">Template Preview</h2>
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2 py-1 rounded">
            {template.name}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadPreview}
            className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-900 border border-zinc-700 rounded-md hover:bg-zinc-800 hover:text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Preview PDF
          </button>
          
          <button 
            onClick={handleApply}
            disabled={isApplying}
            className="px-4 py-2 text-sm font-bold text-zinc-950 bg-emerald-500 rounded-md hover:bg-emerald-400 flex items-center gap-2 shadow-md"
          >
            {isApplying ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Check className="w-4 h-4" />
            )}
            Use This Template
          </button>

          <div className="w-px h-6 bg-zinc-800 mx-1"></div>

          <button 
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex w-full h-full pt-16">
        {/* Left Sidebar - Customizer */}
        <TemplateCustomizer 
          customizations={customizations} 
          onChange={setCustomizations} 
          templateConfig={template}
        />

        {/* Right Area - Live Preview */}
        <div className="flex-1 overflow-hidden relative bg-zinc-900">
          <TemplateRenderer 
            templateId={template.id} 
            resumeData={resumeData} 
            customizations={customizations} 
          />
        </div>
      </div>
    </div>
  );
};

export default TemplatePreviewModal;
