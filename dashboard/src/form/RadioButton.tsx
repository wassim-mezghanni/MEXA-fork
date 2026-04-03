import React from 'react';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
}

export function Radio({ label, className = '', ...props }: RadioProps) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer group select-none ${className}`}>
      <div className="relative w-5 h-5">
        <input
          type="radio"
          className="peer sr-only"
          {...props}
        />
        <div className="
          w-5 h-5 rounded-full border-none
          bg-surface-container-highest
          transition-all duration-300
          peer-checked:bg-primary-container
          peer-checked:scale-110
          group-hover:bg-outline/20
        " />
        <div className="
          absolute inset-0 m-auto w-2 h-2 rounded-full bg-white
          opacity-0 peer-checked:opacity-100
          transition-all duration-300
          pointer-events-none
        " />
      </div>
      <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
        {label}
      </span>
    </label>
  );
};

export default Radio;
