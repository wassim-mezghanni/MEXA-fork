import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  type = 'text',
  className = '',
  ...props
}, ref) => {
  const baseInputStyles = `
    w-full 
    bg-surface-container-high 
    border-none 
    rounded-lg 
    p-4 
    font-body 
    text-on-surface 
    placeholder:text-outline 
    transition-all 
    duration-300 
    focus:ring-4 
    focus:ring-primary/10 
    focus:bg-surface-container-lowest 
    focus:outline-none
    ${error ? 'ring-2 ring-error/20 bg-error/5' : ''}
    ${icon ? (iconPosition === 'left' ? 'pl-12' : 'pr-12') : ''}
  `;

  return (
    <div className={`space-y-2 w-full ${className}`}>
      {label && (
        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1 font-heading">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <span className="icon absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
            {icon}
          </span>
        )}
        
        <input 
          ref={ref} 
          type={type} 
          className={baseInputStyles} 
          {...props} 
        />
        
        {icon && iconPosition === 'right' && (
          <span className="icon absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
            {icon}
          </span>
        )}
      </div>
      
      {error && <p className="text-xs font-bold text-error mt-1 px-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-on-surface-variant/70 mt-1 px-1">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
