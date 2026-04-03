import React from 'react';

export interface RadarDataset {
  label: string;
  /** Values 0-1 for each axis, mapped to polygon radius */
  values: number[];
  fill: string;   // e.g. "rgba(0,70,85,0.15)"
  stroke: string;  // e.g. "#004655"
  strokeWidth?: number;
}

export interface RadarScoreItem {
  label: string;
  value: number | string;
  colorClass?: string; // e.g. "text-primary"
}

export interface FeatureRadarProps {
  title?: string;
  /** Axis labels — placed N, E, S, W around the chart */
  axes?: string[];
  datasets: RadarDataset[];
  /** Optional score rows shown below the chart */
  scores?: RadarScoreItem[];
  /** Number of concentric guide rings */
  rings?: number;
  className?: string;
}

/**
 * Converts polar (angle, radius) to cartesian for SVG centered at (cx, cy).
 */
function polarToCartesian(cx: number, cy: number, angle: number, radius: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

export const FeatureRadar: React.FC<FeatureRadarProps> = ({
  title = 'Feature Radar',
  axes = ['Morphology', 'Pragmatic', 'Syntax', 'Semantic'],
  datasets,
  scores = [],
  rings = 3,
  className = '',
}) => {
  const cx = 50;
  const cy = 50;
  const maxR = 45;
  const n = axes.length;
  const angleStep = 360 / n;

  // Generate polygon points from dataset values
  function dataToPolygon(values: number[]): string {
    return values
      .map((v, i) => {
        const angle = i * angleStep;
        const r = v * maxR;
        const { x, y } = polarToCartesian(cx, cy, angle, r);
        return `${x},${y}`;
      })
      .join(' ');
  }

  // Axis label positions — N/E/S/W style
  const labelPositions: Record<number, string> = {
    0: 'absolute top-0 left-1/2 -translate-x-1/2',
    1: 'absolute right-0 top-1/2 -translate-y-1/2 rotate-90',
    2: 'absolute bottom-0 left-1/2 -translate-x-1/2',
    3: 'absolute left-0 top-1/2 -translate-y-1/2 -rotate-90',
  };

  return (
    <div className={`bg-surface-container-highest p-8 rounded-xl ${className}`}>
      {title && (
        <h3 className="text-lg font-headline font-bold text-primary mb-6 uppercase tracking-wider">
          {title}
        </h3>
      )}

      <div className="relative w-full aspect-square flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
          {/* Guide rings */}
          {Array.from({ length: rings }, (_, i) => {
            const r = maxR * ((i + 1) / rings);
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="#bfc8cc"
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
            );
          })}

          {/* Axis lines */}
          {axes.map((_, i) => {
            const angle = i * angleStep;
            const end = polarToCartesian(cx, cy, angle, maxR);
            const opp = polarToCartesian(cx, cy, angle + 180, maxR);
            return (
              <line
                key={i}
                x1={opp.x}
                y1={opp.y}
                x2={end.x}
                y2={end.y}
                stroke="#bfc8cc"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Data polygons */}
          {datasets.map((ds, i) => (
            <polygon
              key={i}
              points={dataToPolygon(ds.values)}
              fill={ds.fill}
              stroke={ds.stroke}
              strokeWidth={ds.strokeWidth ?? 1}
            />
          ))}
        </svg>

        {/* Axis labels */}
        {axes.map((label, i) => (
          <div
            key={label}
            className={`${labelPositions[i] ?? ''} text-[10px] font-bold text-primary tracking-tighter uppercase`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Scores */}
      {scores.length > 0 && (
        <div className="mt-8 space-y-3">
          {scores.map((s) => (
            <div key={s.label} className="flex justify-between items-center bg-white/50 p-2 rounded">
              <span className="text-xs font-medium text-on-surface">{s.label}</span>
              <span className={`text-xs font-bold ${s.colorClass ?? 'text-primary'}`}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeatureRadar;
