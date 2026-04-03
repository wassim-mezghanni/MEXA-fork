import React from 'react';

export interface KPICardProps {
  title: string;
  value: string | number;
  currency?: string;
  trend?: { value: number; label?: string };
  icon: string;
  description?: React.ReactNode;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  currency,
  trend,
  icon,
  description,
  className = ''
}) => {
  return (
    <div className={`bg-surface-container-lowest rounded-xl shadow-[0_10px_30px_-5px_rgba(25,28,29,0.05)] p-10 relative overflow-hidden ${className}`}>
      {/* Subtle Forest Accent (Corner Glow) */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-container/5 rounded-full blur-3xl"></div>
      
      {/* Card Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-primary-container">
            <span className="icon text-xl">{icon}</span>
          </div>
          <span className="font-headline text-sm font-semibold tracking-wide text-on-surface-variant uppercase">
            {title}
          </span>
        </div>
        
        {trend && (
          <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${trend.value >= 0 ? 'bg-secondary-fixed' : 'bg-error-container'}`}>
            <span className={`icon text-xs ${trend.value >= 0 ? 'text-on-primary-fixed-variant' : 'text-on-error-container'}`}>
              {trend.value >= 0 ? 'trending_up' : 'trending_down'}
            </span>
            <span className={`text-xs font-bold font-label ${trend.value >= 0 ? 'text-on-primary-fixed-variant' : 'text-on-error-container'}`}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
          </div>
        )}
      </div>

      {/* Main Metric Content */}
      <div className="space-y-2 relative z-10 mt-4">
        <div className="flex items-baseline gap-2 flex-wrap min-w-0">
          <span className="font-headline text-4xl xl:text-5xl font-extrabold tracking-tighter text-primary-container truncate">
            {value}
          </span>
          {currency && (
            <span className="font-headline text-xl xl:text-2xl font-bold text-on-primary-container/40">
              {currency}
            </span>
          )}
        </div>
        
        {/* Editorial Insight Text */}
        {description && (
          <div className="pt-6 border-t border-outline-variant/15 mt-6">
            <div className="text-on-surface-variant leading-relaxed font-body text-sm">
              {description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
