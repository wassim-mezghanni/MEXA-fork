import React from 'react';

export interface HeatmapRow {
  label: string;
  color: string; // rgb base e.g. "0, 70, 85"
  opacities: number[]; // 0-100 per cell
}

export interface HeatmapLegendItem {
  color: string; // tailwind class e.g. "bg-primary"
  label: string;
}

export interface LayerwiseHeatmapProps {
  title?: string;
  subtitle?: string;
  rows: HeatmapRow[];
  axisLabels?: string[];
  legend?: HeatmapLegendItem[];
  actions?: { icon: string; label: string; onClick?: () => void }[];
  className?: string;
}

export const LayerwiseHeatmap: React.FC<LayerwiseHeatmapProps> = ({
  title = 'Layer-wise Delta Heatmap',
  subtitle = 'Cosine Similarity Shift [Δ] per Layer Across Parallel Corpuses',
  rows,
  axisLabels = ['Input Embeddings', 'Mid-Model Attention Stacks', 'Logit Projection'],
  legend = [],
  actions = [
    { icon: 'download', label: 'SVG' },
    { icon: 'code', label: 'LATEX' },
  ],
  className = '',
}) => {
  const numCols = rows[0]?.opacities.length ?? 32;

  return (
    <div className={`bg-surface-container-low p-8 rounded-xl relative overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-lg font-headline font-bold text-primary mb-1 uppercase tracking-wider">
            {title}
          </h3>
          <p className="text-xs text-on-surface-variant font-label">{subtitle}</p>
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

      {/* Heatmap Grid */}
      <div className="w-full space-y-1 mb-4">
        {rows.map((row, ri) => (
          <div key={ri}>
            {row.label && (
              <div className="text-[9px] text-on-surface-variant uppercase tracking-widest mb-1 font-label">
                {row.label}
              </div>
            )}
            <div
              className="grid gap-0.5"
              style={{ gridTemplateColumns: `repeat(${numCols}, 1fr)` }}
            >
              {row.opacities.map((op, ci) => (
                <div
                  key={ci}
                  className="h-8 rounded-[1px] transition-opacity hover:opacity-80"
                  style={{ backgroundColor: `rgba(${row.color}, ${op / 100})` }}
                  title={`Layer ${ci + 1}: ${(op / 100).toFixed(2)}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Axis labels */}
      {axisLabels.length > 0 && (
        <div className="flex justify-between text-[10px] text-on-surface-variant font-label uppercase tracking-widest mt-2">
          {axisLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      )}

      {/* Legend */}
      {legend.length > 0 && (
        <div className="mt-8 flex items-center gap-6 border-t border-outline-variant/20 pt-6">
          {legend.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 ${item.color}`} />
              <span className="text-[10px] text-on-surface-variant uppercase tracking-widest">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LayerwiseHeatmap;
