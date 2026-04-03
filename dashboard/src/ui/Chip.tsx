import React from 'react';

export type ChipVariant = 'primary' | 'secondary' | 'error' | 'outline' | 'surface';

export interface ChipProps {
  label: string;
  icon?: string;
  onDelete?: () => void;
  className?: string;
  active?: boolean;
  variant?: ChipVariant;
}

export function Chip({
  label,
  icon,
  onDelete,
  className = '',
  active = false,
  variant,
}: ChipProps) {
  const baseStyles = "inline-flex items-center gap-2 px-3 py-1 rounded-full font-label text-[10px] font-bold uppercase tracking-wider transition-all duration-300 select-none whitespace-nowrap";
  
  const getVariantStyles = () => {
    if (active) return "bg-primary-container text-on-primary shadow-sm";
    
    switch (variant) {
      case 'primary':
        return "bg-primary/10 text-primary border border-primary/20";
      case 'secondary':
        return "bg-secondary-container/50 text-on-secondary-container border border-secondary-container";
      case 'error':
        return "bg-error/10 text-error border border-error/20";
      case 'outline':
        return "bg-transparent text-outline border border-outline/30";
      case 'surface':
        return "bg-surface-container-high text-on-surface-variant";
      default:
        return active 
          ? "bg-primary-container text-on-primary shadow-sm" 
          : "bg-secondary-container text-on-secondary-container hover:bg-on-secondary-container hover:text-white";
    }
  };

  return (
    <div className={`${baseStyles} ${getVariantStyles()} ${className}`}>
      {icon && <span className="icon text-[1.4em]">{icon}</span>}
      <span className="leading-tight">{label}</span>
      {onDelete && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="hover:scale-110 active:scale-95 transition-transform"
        >
          <span className="icon text-[1em]">close</span>
        </button>
      )}
    </div>
  );
};

export default Chip;
