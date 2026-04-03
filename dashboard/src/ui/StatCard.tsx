import React from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  /** Tailwind border-l color class. Defaults to "border-primary" */
  accentColor?: string;
  /** Tailwind text color class for the value. Defaults to "text-primary" */
  valueColor?: string;
  className?: string;
}

/**
 * Compact stat display with a left accent border.
 * Used for metrics like Standard Deviation, Kurtosis, etc.
 * Lighter than KPICard — no icon, no trend, just label + big number.
 */
export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  accentColor = 'border-primary',
  valueColor = 'text-primary',
  className = '',
}) => {
  return (
    <div className={`p-4 bg-white rounded shadow-sm border-l-2 ${accentColor} ${className}`}>
      <div className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">
        {label}
      </div>
      <div className={`text-xl font-headline font-extrabold ${valueColor}`}>{value}</div>
    </div>
  );
};

export default StatCard;
