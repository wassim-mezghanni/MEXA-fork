import React from 'react';

export interface ToggleOption {
  key: string;
  label: string;
}

export interface ToggleGroupProps {
  options: ToggleOption[];
  value: string;
  onChange: (key: string) => void;
  /** Optional label text displayed above the toggle */
  label?: string;
  className?: string;
}

/**
 * Small pill-style toggle group (e.g. SPARSE / DENSE, Max / Mean).
 * Matches the Scholarly Lens control pattern.
 */
export const ToggleGroup: React.FC<ToggleGroupProps> = ({
  options,
  value,
  onChange,
  label,
  className = '',
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">
          {label}
        </label>
      )}
      <div className="flex bg-surface-container-low p-1 rounded">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`px-3 py-1 text-[10px] font-bold uppercase transition-all ${
              value === opt.key
                ? 'bg-white shadow-sm rounded text-on-surface'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ToggleGroup;
