export interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function FilterChip({
  label,
  active = false,
  onClick,
  className = '',
}: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-label font-semibold border transition-colors ${
        active
          ? 'bg-primary text-on-primary border-primary'
          : 'bg-transparent text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary'
      } ${className}`}
    >
      {label}
    </button>
  );
}
