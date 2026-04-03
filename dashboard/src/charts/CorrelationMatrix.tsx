import React, { useState } from 'react';

export interface CorrelationMatrixProps {
  title?: string;
  subtitle?: string;
  /** Row/column labels (symmetric matrix, so same for both axes) */
  labels: string[];
  /** 2D array of correlation values (0-1). matrix[row][col] */
  matrix: number[][];
  /** Color stops: array of { threshold, color } sorted ascending */
  colorStops?: { threshold: number; color: string }[];
  /** Show values inside cells */
  showValues?: boolean;
  /** Highlight the diagonal */
  highlightDiagonal?: boolean;
  className?: string;
}

const DEFAULT_STOPS = [
  { threshold: 0.0, color: '#e7e8e9' },
  { threshold: 0.2, color: '#b9c9cf' },
  { threshold: 0.4, color: '#8bd1e8' },
  { threshold: 0.6, color: '#13677b' },
  { threshold: 0.8, color: '#005f73' },
  { threshold: 1.0, color: '#004655' },
];

function interpolateColor(value: number, stops: { threshold: number; color: string }[]): string {
  if (value <= stops[0].threshold) return stops[0].color;
  if (value >= stops[stops.length - 1].threshold) return stops[stops.length - 1].color;

  for (let i = 0; i < stops.length - 1; i++) {
    if (value >= stops[i].threshold && value <= stops[i + 1].threshold) {
      const t = (value - stops[i].threshold) / (stops[i + 1].threshold - stops[i].threshold);
      return lerpHex(stops[i].color, stops[i + 1].color, t);
    }
  }
  return stops[stops.length - 1].color;
}

function lerpHex(a: string, b: string, t: number): string {
  const parse = (hex: string) => {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

function textColorForBg(value: number): string {
  return value > 0.55 ? 'text-white' : 'text-on-surface';
}

export const CorrelationMatrix: React.FC<CorrelationMatrixProps> = ({
  title = 'Correlation Matrix',
  subtitle,
  labels,
  matrix,
  colorStops = DEFAULT_STOPS,
  showValues = true,
  highlightDiagonal = true,
  className = '',
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  return (
    <div className={`bg-surface-container-low p-8 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-lg font-headline font-bold text-primary mb-1 uppercase tracking-wider">
          {title}
        </h3>
        {subtitle && <p className="text-xs text-on-surface-variant font-label">{subtitle}</p>}
      </div>

      {/* Legend gradient */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">
          Low
        </span>
        <div
          className="h-2.5 flex-1 max-w-48 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${colorStops.map((s) => s.color).join(', ')})`,
          }}
        />
        <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">
          High
        </span>
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <table className="border-collapse">
          {/* Column headers */}
          <thead>
            <tr>
              <th className="w-28 min-w-28" />
              {labels.map((label, ci) => (
                <th
                  key={ci}
                  className={`text-[10px] font-bold uppercase tracking-wider px-1 pb-3 text-center min-w-12 ${
                    hoveredCell?.col === ci ? 'text-primary' : 'text-on-surface-variant'
                  }`}
                >
                  <span className="block -rotate-45 origin-bottom-left translate-x-3 whitespace-nowrap">
                    {label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {labels.map((rowLabel, ri) => (
              <tr key={ri}>
                {/* Row header */}
                <td
                  className={`text-xs font-medium pr-4 py-0.5 text-right whitespace-nowrap ${
                    hoveredCell?.row === ri ? 'text-primary font-bold' : 'text-on-surface-variant'
                  }`}
                >
                  {rowLabel}
                </td>

                {/* Cells */}
                {matrix[ri].map((value, ci) => {
                  const isDiag = ri === ci;
                  const isHovered =
                    hoveredCell?.row === ri || hoveredCell?.col === ci;
                  const isExactHover =
                    hoveredCell?.row === ri && hoveredCell?.col === ci;

                  return (
                    <td
                      key={ci}
                      className={`relative text-center transition-all duration-150 ${
                        isDiag && highlightDiagonal ? 'ring-1 ring-primary/30 ring-inset' : ''
                      } ${isExactHover ? 'scale-110 z-10 shadow-lg' : ''} ${
                        isHovered && !isExactHover ? 'opacity-90' : ''
                      }`}
                      style={{
                        backgroundColor: interpolateColor(value, colorStops),
                        width: 44,
                        height: 44,
                      }}
                      onMouseEnter={() => setHoveredCell({ row: ri, col: ci })}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={`${rowLabel} × ${labels[ci]}: ${value.toFixed(3)}`}
                    >
                      {showValues && (
                        <span
                          className={`text-[10px] font-bold ${textColorForBg(value)} ${
                            isExactHover ? 'text-xs' : ''
                          }`}
                        >
                          {value.toFixed(2)}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hover info */}
      {hoveredCell && (
        <div className="mt-4 flex items-center gap-2 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-sm">info</span>
          <span className="font-medium text-on-surface">
            {labels[hoveredCell.row]} × {labels[hoveredCell.col]}
          </span>
          <span className="font-mono font-bold text-primary">
            {matrix[hoveredCell.row][hoveredCell.col].toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
};

export default CorrelationMatrix;
