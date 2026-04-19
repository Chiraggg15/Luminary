import { Calendar } from 'lucide-react';
import { useRef } from 'react';

/**
 * A professional date/month input component with a themed calendar icon.
 */
export default function CalendarInput({ label, value, onChange, id, type = 'month', disabled = false, placeholder }) {
  const inputRef = useRef(null);

  const handleClick = () => {
    if (disabled) return;
    // Trigger the native date picker if supported
    if (inputRef.current?.showPicker) {
      inputRef.current.showPicker();
    } else {
      inputRef.current?.focus();
      inputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="label-glass">{label}</label>}
      <div 
        className={`relative group cursor-pointer transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleClick}
      >
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-hover:text-emerald-500 transition-colors">
          <Calendar size={18} />
        </div>
        <input
          ref={inputRef}
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={`input-glass pl-11 pr-4 appearance-none hover:border-zinc-700 focus:border-emerald-500/50 ${disabled ? 'bg-zinc-900/50 text-zinc-600' : 'text-zinc-100'}`}
          style={{ 
            // Ensures the native icon doesn't overlap or look out of place if we are using our own
            colorScheme: 'dark' 
          }}
        />
        {/* We can hide the native indicator or style it if needed via CSS, but keeping it as a backup for accessibility */}
      </div>
    </div>
  );
}
