import React from 'react';
import { Settings2, Type, Palette } from 'lucide-react';

const TemplateCustomizer = ({ customizations, onChange, templateConfig }) => {
  const { accentColorDefault } = templateConfig || {};
  
  const handleColorChange = (e) => {
    onChange({ ...customizations, accentColor: e.target.value });
  };

  const handleFontChange = (e) => {
    onChange({ ...customizations, fontFamily: e.target.value });
  };

  const fonts = [
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Inter', value: 'Inter, sans-serif' },
    { label: 'Poppins', value: 'Poppins, sans-serif' },
    { label: 'Playfair Display', value: 'Playfair Display, serif' },
    { label: 'Fira Code', value: 'Fira Code, monospace' },
  ];

  return (
    <div className="bg-zinc-950 p-6 border-r border-zinc-800 h-full overflow-y-auto flex flex-col gap-6 w-80 shrink-0 shadow-lg relative z-10">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <Settings2 className="w-5 h-5 text-emerald-500" />
          Customization
        </h3>
        <p className="text-xs text-zinc-400">Personalize your resume design</p>
      </div>

        <>
          {/* Colors */}
          <div>
            <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-zinc-500" />
              Accent Color
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={customizations.accentColor || accentColorDefault || '#000000'}
                onChange={handleColorChange}
                className="w-10 h-10 rounded cursor-pointer border-0 p-0"
              />
              <span className="text-sm text-zinc-400 font-mono">
                {customizations.accentColor || accentColorDefault || '#000000'}
              </span>
            </div>
          </div>

          {/* Typography */}
          <div>
            <label className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-zinc-500" />
              Typography
            </label>
            <select
              value={customizations.fontFamily || fonts[0].value}
              onChange={handleFontChange}
              className="w-full border border-zinc-700 bg-zinc-800 text-zinc-200 rounded-md p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              {fonts.map(font => (
                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
        </>

      {/* Template Info */}
      <div className="mt-auto pt-4 border-t border-zinc-800">
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Active Template</h4>
        <div className="text-sm font-medium text-zinc-200">{templateConfig?.name}</div>
        <div className="text-xs text-zinc-400 mt-1">{templateConfig?.description}</div>
      </div>
    </div>
  );
};

export default TemplateCustomizer;
