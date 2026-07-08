import React from 'react';

const ATSMaximizer = ({ resumeData, customizations }) => {
  const styles = {
    fontFamily: customizations?.fontFamily || 'Arial, sans-serif',
    color: '#000000',
    lineHeight: 1.5,
    fontSize: '11pt'
  };

  const accentColor = customizations?.accentColor || '#000000';

  return (
    <div className="bg-white p-12 max-w-4xl mx-auto min-h-[1056px]" style={styles}>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase mb-1">{resumeData?.contact?.name || 'YOUR NAME'}</h1>
        <div className="text-sm">
          {resumeData?.contact?.location && <span>{resumeData.contact.location} | </span>}
          {resumeData?.contact?.phone && <span>{resumeData.contact.phone} | </span>}
          {resumeData?.contact?.email && <span>{resumeData.contact.email}</span>}
          {resumeData?.contact?.linkedin && <span> | {resumeData.contact.linkedin}</span>}
        </div>
      </div>

      {resumeData?.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b mb-2" style={{ borderColor: accentColor, color: accentColor }}>Summary</h2>
          <p className="text-sm">{resumeData.summary}</p>
        </div>
      )}

      {resumeData?.skills && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b mb-2" style={{ borderColor: accentColor, color: accentColor }}>Skills</h2>
          <p className="text-sm">
            {resumeData.skills.technical && resumeData.skills.technical.join(', ')}
            {resumeData.skills.technical && resumeData.skills.soft && ', '}
            {resumeData.skills.soft && resumeData.skills.soft.join(', ')}
          </p>
        </div>
      )}

      {resumeData?.experience && resumeData.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b mb-2" style={{ borderColor: accentColor, color: accentColor }}>Professional Experience</h2>
          {resumeData.experience.map((exp, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between font-bold text-sm">
                <span>{exp.title}</span>
                <span>{exp.startDate} - {exp.endDate}</span>
              </div>
              <div className="text-sm italic mb-1">
                {exp.company}, {exp.location}
              </div>
              <ul className="list-disc list-inside text-sm ml-4">
                {exp.bullets && exp.bullets.map((bullet, bIdx) => (
                  <li key={bIdx}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {resumeData?.education && resumeData.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b mb-2" style={{ borderColor: accentColor, color: accentColor }}>Education</h2>
          {resumeData.education.map((edu, idx) => (
            <div key={idx} className="mb-2 text-sm flex justify-between">
              <div>
                <span className="font-bold">{edu.degree}</span>
                <br />
                {edu.institution}
              </div>
              <div>{edu.year}</div>
            </div>
          ))}
        </div>
      )}
      
      {resumeData?.certifications && resumeData.certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b mb-2" style={{ borderColor: accentColor, color: accentColor }}>Certifications</h2>
          {resumeData.certifications.map((cert, idx) => (
            <div key={idx} className="mb-1 text-sm">
              <span className="font-bold">{cert.name}</span>, {cert.issuer} ({cert.year})
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ATSMaximizer;
