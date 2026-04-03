import type { InputHTMLAttributes } from 'react';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
}

export const Checkbox = ({ label, className = '', ...props }: CheckboxProps) => {
  return (
    <label className={`flex items-center gap-3 cursor-pointer group select-none ${className}`}>
      <div className="relative w-5 h-5">
        <input
          type="checkbox"
          className="peer sr-only"
          {...props}
        />
        <div className="
          w-5 h-5 rounded border-none
          bg-surface-container-highest
          transition-all duration-300
          peer-checked:bg-primary-container
          peer-checked:scale-110
          group-hover:bg-outline/20
        " />
        <svg
          className="absolute inset-0 m-auto w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 peer-checked:scale-100 transition-all duration-300 scale-50 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
        {label}
      </span>
    </label>
  );
};
