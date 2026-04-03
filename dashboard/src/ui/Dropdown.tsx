import { useState, useRef, useEffect } from 'react';

export interface DropdownOption {
  id: string;
  label: string;
  icon?: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (id: string) => void;
  icon?: string;
  className?: string;
}

export function Dropdown({ options, value, onChange, icon, className = '' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find(o => o.id === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-outline hover:text-primary hover:bg-primary-container/10 transition-colors cursor-pointer"
      >
        {(selected?.icon ?? icon) && <span className="icon text-[18px]">{selected?.icon ?? icon}</span>}
        <span>{selected?.label ?? 'Select'}</span>
        <span className={`icon text-[14px] transition-transform ${open ? 'rotate-180' : ''}`}>expand_more</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 min-w-[160px] bg-surface-container-lowest/95 backdrop-blur-xl rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-1 z-50 overflow-hidden">
          {options.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => { onChange(option.id); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-medium transition-colors cursor-pointer rounded-lg ${
                option.id === value
                  ? 'text-primary bg-primary-container/10'
                  : 'text-on-surface-variant hover:text-primary hover:bg-primary-container/10'
              }`}
            >
              {option.icon && <span className="icon text-[16px]">{option.icon}</span>}
              <span>{option.label}</span>
              {option.id === value && <span className="icon text-[14px] ml-auto text-primary">check</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
