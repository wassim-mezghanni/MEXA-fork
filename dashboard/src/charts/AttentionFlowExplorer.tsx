import React, { useState } from 'react';

export interface AlignmentLink {
  sourceIndex: number;
  targetIndex: number;
  weight: number; // 0-1, controls stroke width and opacity
}

export interface AttentionFlowExplorerProps {
  title?: string;
  subtitle?: string;
  sourceTokens: string[];
  targetTokens: string[];
  /** Token indices to highlight (bold + filled bg) */
  highlightSource?: number[];
  highlightTarget?: number[];
  /** Alignment lines between source ↔ target */
  alignments?: AlignmentLink[];
  /** Model layer options for the dropdown */
  layers?: string[];
  sourceColor?: string; // tailwind color name e.g. "primary"
  targetColor?: string; // tailwind color name e.g. "tertiary"
  className?: string;
}

export const AttentionFlowExplorer: React.FC<AttentionFlowExplorerProps> = ({
  title = 'Attention Flow Explorer',
  subtitle = 'Visualizing token-level cross-lingual mapping across Attention Heads',
  sourceTokens,
  targetTokens,
  highlightSource = [],
  highlightTarget = [],
  alignments = [
    { sourceIndex: 0, targetIndex: 0, weight: 0.2 },
    { sourceIndex: 2, targetIndex: 2, weight: 0.9 },
    { sourceIndex: 2, targetIndex: 3, weight: 0.5 },
    { sourceIndex: 5, targetIndex: 4, weight: 0.2 },
    { sourceIndex: 6, targetIndex: 5, weight: 0.2 },
  ],
  layers = ['Layer 16 (Mid-Stage)', 'Layer 32 (Logit Head)'],
  sourceColor = 'primary',
  targetColor = 'tertiary',
  className = '',
}) => {
  const [density, setDensity] = useState<'sparse' | 'dense'>('sparse');
  const [selectedLayer, setSelectedLayer] = useState(0);

  const numTokens = Math.max(sourceTokens.length, targetTokens.length);
  const svgHeight = numTokens * 28;

  return (
    <div
      className={`bg-white p-10 rounded-xl shadow-sm border border-outline-variant/10 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h3 className="text-xl font-headline font-extrabold text-primary mb-1 uppercase tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-on-surface-variant font-body">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Layer selector */}
          <div className="flex flex-col">
            <label className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">
              Select Model Layer
            </label>
            <select
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(Number(e.target.value))}
              className="text-xs bg-surface-container-low border-none rounded py-1.5 focus:ring-1 focus:ring-primary focus:outline-none"
            >
              {layers.map((l, i) => (
                <option key={i} value={i}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Density toggle */}
          <div className="flex flex-col">
            <label className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant mb-1">
              View Density
            </label>
            <div className="flex bg-surface-container-low p-1 rounded">
              {(['sparse', 'dense'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDensity(d)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase ${
                    density === d
                      ? 'bg-white shadow-sm rounded text-on-surface'
                      : 'text-on-surface-variant'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Token alignment visualization */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_200px_1fr] items-center gap-4">
        {/* Source tokens */}
        <div className="space-y-2 text-right">
          {sourceTokens.map((token, i) => {
            const isHl = highlightSource.includes(i);
            return (
              <div
                key={i}
                className={`inline-block px-4 py-2 text-sm border-r-2 border-${sourceColor} rounded-l-lg transition-colors cursor-pointer ${
                  isHl
                    ? `bg-${sourceColor} text-white font-bold shadow-md`
                    : `bg-${sourceColor}/5 text-${sourceColor} font-medium hover:bg-${sourceColor}/10`
                }`}
              >
                {token}
              </div>
            );
          })}
        </div>

        {/* Alignment lines */}
        <div className="h-64 relative opacity-40">
          <svg
            viewBox={`0 0 100 ${svgHeight}`}
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {alignments.map((a, i) => {
              const y1 = (a.sourceIndex / numTokens) * svgHeight + 14;
              const y2 = (a.targetIndex / numTokens) * svgHeight + 14;
              return (
                <line
                  key={i}
                  x1="0"
                  y1={y1}
                  x2="100"
                  y2={y2}
                  stroke="#004655"
                  strokeWidth={0.5 + a.weight * 2}
                  strokeOpacity={0.3 + a.weight * 0.7}
                />
              );
            })}
          </svg>
        </div>

        {/* Target tokens */}
        <div className="space-y-2 text-left">
          {targetTokens.map((token, i) => {
            const isHl = highlightTarget.includes(i);
            return (
              <div
                key={i}
                className={`inline-block px-4 py-2 text-sm border-l-2 border-${targetColor} rounded-r-lg ${
                  isHl
                    ? `bg-${targetColor} text-white font-bold shadow-md`
                    : `bg-${targetColor}/5 text-${targetColor} font-medium`
                }`}
              >
                {token}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AttentionFlowExplorer;
