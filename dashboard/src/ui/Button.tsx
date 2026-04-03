import type { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  icon?: string;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export const Button = ({
  variant = 'primary',
  icon,
  iconPosition = 'left',
  className = '',
  children,
  ...props
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-heading font-semibold transition-all duration-300 active:scale-[0.98]";
  
  const variants: Record<string, string> = {
    primary: "bg-primary-container text-on-primary hover:bg-primary shadow-sm focus:ring-4 focus:ring-primary/20",
    secondary: "bg-surface-container-highest text-on-surface hover:bg-outline-variant",
    tertiary: "text-primary hover:bg-surface-container-low px-4"
  };

  const renderIcon = () => icon && (
    <span className="icon text-[1.1em]">{icon}</span>
  );

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && renderIcon()}
      <span className="leading-none">{children}</span>
      {icon && iconPosition === 'right' && renderIcon()}
    </button>
  );
};
