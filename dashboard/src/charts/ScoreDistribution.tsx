import React from 'react';

export interface DistributionCurve {
  /** SVG path d attribute */
  path: string;
  /** Optional filled area path */
  fillPath?: string;
  stroke: string;
  fill?: string;
  strokeDasharray?: string;
}

export interface StatItem {
  label: string;
  value: string | number;
  /** Tailwind border color class e.g. "border-primary" */
  borderColor?: string;
  /** Tailwind text color class e.g. "text-primary" */
  textColor?: string;
}

export interface ScoreDistributionProps {
  title?: string;
  curves: DistributionCurve[];
  stats?: StatItem[];
  /** Labels for the x-axis (left, center, right) */
  axisLabels?: string[];
  className?: string;
}

export const ScoreDistribution: React.FC<ScoreDistributionProps> = ({
  title = 'Score Distributions',
  curves,
  stats = [],
  axisLabels = ['-1.0 σ', 'Mean (μ)', '+1.0 σ'],
  className = '',
}) => {
  return (
    <div className={`bg-surface-container-low p-8 rounded-xl ${className}`}>
      {title && (
        <h3 className="text-lg font-headline font-bold text-primary mb-6 uppercase tracking-wider">
          {title}
        </h3>
      )}

      <div className="space-y-12">
        {/* SVG Chart */}
        <div className="relative h-40 w-full">
          <svg viewBox="0 0 400 100" className="w-full h-full">
            {/* Baseline */}
            <line x1="0" y1="90" x2="400" y2="90" stroke="#bfc8cc" strokeWidth="0.5" />
            {/* Center line */}
            <line
              x1="200"
              y1="0"
              x2="200"
              y2="95"
              stroke="#bfc8cc"
              strokeWidth="0.5"
              strokeDasharray="4 4"
            />

            {curves.map((curve, i) => (
              <React.Fragment key={i}>
                {curve.fillPath && (
                  <path d={curve.fillPath} fill={curve.fill ?? 'rgba(0,70,85,0.05)'} />
                )}
                <path
                  d={curve.path}
                  fill="none"
                  stroke={curve.stroke}
                  strokeWidth="2"
                  strokeDasharray={curve.strokeDasharray}
                />
              </React.Fragment>
            ))}
          </svg>

          {/* X-axis labels */}
          {axisLabels.length > 0 && (
            <div className="flex justify-between mt-2 text-[10px] text-on-surface-variant font-label uppercase tracking-tighter">
              {axisLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          )}
        </div>

        {/* Stat cards */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`p-4 bg-white rounded shadow-sm border-l-2 ${stat.borderColor ?? 'border-primary'}`}
              >
                <div className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">
                  {stat.label}
                </div>
                <div
                  className={`text-xl font-headline font-extrabold ${stat.textColor ?? 'text-primary'}`}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreDistribution;
