import type React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string } [];
}

export function Select({
  label,
  error,
  options,
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className={`space-y-2 w-full ${className}`}>
      {label && (
        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1 font-heading">
          {label}
        </label>
      )}
      
      <div className="relative group">
        <select 
          className="
            w-full 
            bg-surface-container-high 
            border-none 
            rounded-lg 
            p-4 
            font-body 
            text-on-surface 
            appearance-none 
            cursor-pointer 
            pr-12 
            transition-all 
            duration-300 
            focus:ring-4 
            focus:ring-primary/10 
            focus:bg-surface-container-lowest 
            focus:outline-none
          "
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        
        <span className="
          icon 
          absolute 
          right-4 
          top-1/2 
          -translate-y-1/2 
          text-primary 
          pointer-events-none 
          transition-transform 
          group-focus-within:rotate-180
        ">
          expand_more
        </span>
      </div>
      
      {error && <p className="text-xs font-bold text-error mt-1 px-1">{error}</p>}
    </div>
  );
};

export default Select;
