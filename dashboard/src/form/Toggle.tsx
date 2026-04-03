import type { InputHTMLAttributes } from 'react';

export interface ToggleProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
}

export const Toggle = ({ label, className = '', ...props }: ToggleProps) => {
  return (
    <div className={`flex items-center justify-between group select-none ${className}`}>
      <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
        {label}
      </span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          {...props} 
        />
        <div className="
          w-11 h-6 
          bg-surface-container-highest 
          peer-focus:outline-none 
          rounded-full 
          peer 
          peer-checked:bg-primary 
          after:content-[''] 
          after:absolute 
          after:top-[2px] 
          after:left-[2px] 
          after:bg-white 
          after:border-gray-300 
          after:border 
          after:rounded-full 
          after:h-5 
          after:w-5 
          after:transition-all 
          peer-checked:after:translate-x-full 
          peer-checked:after:border-white
        "></div>
      </label>
    </div>
  );
};
