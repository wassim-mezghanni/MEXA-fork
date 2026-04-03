import React from 'react';

export interface FigureAction {
  icon: string;
  label: string;
  onClick?: () => void;
}

export interface FigureSectionProps {
  /** e.g. "Fig 01. Layer-wise Delta Heatmap" */
  title: string;
  subtitle?: string;
  actions?: FigureAction[];
  /** Tailwind bg class override. Defaults to bg-surface-container-low */
  bg?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable wrapper for any figure/visualization panel.
 * Provides the standardized header (title + subtitle + action buttons)
 * used across the Scholarly Lens design system.
 */
export const FigureSection: React.FC<FigureSectionProps> = ({
  title,
  subtitle,
  actions = [],
  bg = 'bg-surface-container-low',
  children,
  className = '',
}) => {
  return (
    <section className={`${bg} p-8 rounded-xl relative overflow-hidden ${className}`}>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-lg font-headline font-bold text-primary mb-1 uppercase tracking-wider">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-on-surface-variant font-label">{subtitle}</p>
          )}
        </div>
        {actions.length > 0 && (
          <div className="flex gap-2">
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-lowest text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:bg-white transition-colors rounded"
              >
                <span className="material-symbols-outlined text-sm">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {children}
    </section>
  );
};

export default FigureSection;
