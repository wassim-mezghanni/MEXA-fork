import React from 'react';

export interface Cluster {
  color: string;      // tailwind class e.g. "bg-primary/20"
  position: string;   // tailwind positioning e.g. "top-1/4 left-1/3"
  size: string;       // tailwind width e.g. "w-32 h-32"
}

export interface ProjectionPoint {
  colorClass: string; // tailwind bg class
  size?: 'sm' | 'md';
}

export interface TooltipContent {
  heading: string;
  metric: string;
  detail: string;
}

export interface LatentSpaceProjectionProps {
  title?: string;
  subtitle?: string;
  clusters?: Cluster[];
  points?: ProjectionPoint[];
  tooltip?: TooltipContent;
  className?: string;
}

const DEFAULT_CLUSTERS: Cluster[] = [
  { color: 'bg-primary/20', position: 'top-1/4 left-1/3', size: 'w-32 h-32' },
  { color: 'bg-tertiary/20', position: 'bottom-1/4 right-1/3', size: 'w-40 h-40' },
];

const DEFAULT_POINTS: ProjectionPoint[] = [
  { colorClass: 'bg-primary', size: 'md' },
  { colorClass: 'bg-tertiary' },
  { colorClass: 'bg-primary/70', size: 'md' },
  { colorClass: 'bg-tertiary/60' },
  { colorClass: 'bg-primary', size: 'md' },
  { colorClass: 'bg-primary-fixed-dim' },
  { colorClass: 'bg-tertiary', size: 'md' },
  { colorClass: 'bg-primary-container' },
  { colorClass: 'bg-primary' },
  { colorClass: 'bg-tertiary/80', size: 'md' },
  { colorClass: 'bg-primary/40' },
  { colorClass: 'bg-tertiary', size: 'md' },
  { colorClass: 'bg-primary-fixed' },
  { colorClass: 'bg-tertiary-fixed', size: 'md' },
  { colorClass: 'bg-primary' },
  { colorClass: 'bg-primary', size: 'md' },
];

export const LatentSpaceProjection: React.FC<LatentSpaceProjectionProps> = ({
  title = 'Latent Space Alignment',
  subtitle = 't-SNE Projection: English [En] vs Hindi [Hi] across 1536d space',
  clusters = DEFAULT_CLUSTERS,
  points = DEFAULT_POINTS,
  tooltip = {
    heading: 'Vector: Token_ID_4821',
    metric: 'L2 Distance: 0.142 (High Alignment)',
    detail: 'EN: "Democracy" | HI: "लोकतंत्र"',
  },
  className = '',
}) => {
  return (
    <div
      className={`bg-surface-container-low p-8 rounded-xl overflow-hidden relative group ${className}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-lg font-headline font-bold text-primary mb-1 uppercase tracking-wider">
            {title}
          </h3>
          <p className="text-xs text-on-surface-variant font-label italic">{subtitle}</p>
        </div>
        <button className="p-2 hover:bg-surface-container rounded-full transition-colors">
          <span className="material-symbols-outlined">zoom_in</span>
        </button>
      </div>

      {/* Canvas */}
      <div className="relative h-96 w-full rounded-lg bg-surface border border-outline-variant/20 overflow-hidden shadow-inner">
        {/* Dot-grid */}
        <div className="absolute inset-0 opacity-10 dot-grid" />

        <div className="relative h-full flex items-center justify-center">
          {/* Blurred clusters */}
          {clusters.map((c, i) => (
            <div
              key={i}
              className={`absolute ${c.position} ${c.size} ${c.color} blur-3xl rounded-full`}
            />
          ))}

          {/* Scatter points */}
          <div className="grid grid-cols-8 gap-12 rotate-12 scale-110">
            {points.map((p, i) => (
              <div
                key={i}
                className={`${p.size === 'md' ? 'w-1.5 h-1.5' : 'w-1 h-1'} rounded-full ${p.colorClass} ${
                  p.colorClass === 'bg-primary' ? 'shadow-sm shadow-primary/50' : ''
                }`}
              />
            ))}
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass-panel p-4 rounded-lg border border-primary/20 shadow-xl pointer-events-none">
            <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">
              {tooltip.heading}
            </div>
            <div className="text-xs font-medium text-on-surface">{tooltip.metric}</div>
            <div className="text-[9px] text-on-surface-variant mt-2 font-mono">{tooltip.detail}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LatentSpaceProjection;
