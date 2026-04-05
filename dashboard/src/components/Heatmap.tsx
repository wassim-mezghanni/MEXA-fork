import React, { useState, useMemo } from 'react';

export interface ModelResult {
  code: string;
  [key: string]: string | number;
}

interface HeatmapProps {
  data: ModelResult[];
  languageNames: Record<string, string>;
  models: string[];
}

interface HoveredCell {
  code: string;
  model: string;
  score: number;
}

function scoreToColor(score: number): string {
  if (score === null || score === undefined || isNaN(score)) return 'rgba(30, 41, 59, 0.5)';
  // Blue (low) -> Green (mid) -> Yellow (high)
  const s = Math.max(0, Math.min(1, score));
  if (s < 0.3) {
    const t = s / 0.3;
    return `rgba(${Math.round(30 + t * 20)}, ${Math.round(41 + t * 80)}, ${Math.round(59 + t * 120)}, 0.9)`;
  } else if (s < 0.6) {
    const t = (s - 0.3) / 0.3;
    return `rgba(${Math.round(50 + t * 50)}, ${Math.round(121 + t * 80)}, ${Math.round(179 - t * 80)}, 0.9)`;
  } else if (s < 0.8) {
    const t = (s - 0.6) / 0.2;
    return `rgba(${Math.round(100 + t * 120)}, ${Math.round(201 - t * 20)}, ${Math.round(99 - t * 50)}, 0.9)`;
  } else {
    const t = (s - 0.8) / 0.2;
    return `rgba(${Math.round(220 + t * 34)}, ${Math.round(181 + t * 50)}, ${Math.round(49 - t * 20)}, 0.9)`;
  }
}

export default function Heatmap({ data, languageNames, models }: HeatmapProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null);
  const [showCount, setShowCount] = useState(40);

  const displayModels = useMemo(() => models.filter(m => m !== 'avg'), [models]);

  const filteredData = useMemo(() => {
    let filtered = data;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = data.filter(row => {
        const name = (languageNames[row.code] || row.code).toLowerCase();
        return name.includes(q) || row.code.toLowerCase().includes(q);
      });
    }
    return filtered.slice(0, showCount);
  }, [data, searchTerm, languageNames, showCount]);

  return (
    <div className="bg-surface-container-low p-10 rounded-2xl relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 group">
      {/* Background Accent */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 relative z-10">
        <div>
          <h3 className="text-xl font-headline font-extrabold text-primary mb-1 uppercase tracking-widest flex items-center gap-3">
            <span className="icon text-primary/70">grid_view</span>
            Score Heatmap
          </h3>
          <p className="text-xs text-on-surface-variant font-label uppercase tracking-[0.1em] opacity-70">
            Parallel Model Performance Intersection
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface-container-lowest/50 p-1.5 rounded-xl border border-outline-variant/10 backdrop-blur-sm">
          <div className="relative">
            <span className="icon absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 text-sm">search</span>
            <input
              type="text"
              placeholder="Filter..."
              className="pl-9 pr-4 py-2 bg-transparent text-xs font-label text-on-surface placeholder:text-on-surface-variant/40 outline-none w-40"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setShowCount(40); }}
            />
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest/30 rounded-2xl p-6 border border-outline-variant/10 transition-all relative z-10">
        {/* Color legend */}
        <div className="flex items-center justify-end gap-3 mb-6 px-2">
          <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Representational Drift</span>
          <div className="w-32 h-2 rounded-full bg-gradient-to-r from-[#1e293b] via-[#3279b3] via-[#64c9b3] to-[#ffe231] opacity-80" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">High Alignment</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-separate border-spacing-y-1">
            <thead>
              <tr>
                <th className="sticky left-0 bg-surface-container-low z-20 px-4 py-3 text-left text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10">Variant</th>
                {displayModels.map(m => (
                  <th key={m} className="px-2 py-3 text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 min-w-[80px]">
                    <div className="whitespace-pre-line leading-tight opacity-70 italic">{m.replace('-', '\n')}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-transparent">
              {filteredData.map(row => (
                <tr key={row.code} className="hover:bg-white/40 transition-colors group/row">
                  <td className="sticky left-0 bg-surface-container-low group-hover/row:bg-white/40 z-20 px-4 py-3 border-r border-outline-variant/5">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-on-surface truncate">{languageNames[row.code] || row.code}</span>
                      <span className="text-[9px] font-mono text-on-surface-variant opacity-40 uppercase">{row.code}</span>
                    </div>
                  </td>
                  {displayModels.map(model => {
                    const score = parseFloat(row[model] as string);
                    const isHovered = hoveredCell?.code === row.code && hoveredCell?.model === model;
                    return (
                      <td
                        key={model}
                        className="p-0.5 transition-all duration-300 transform"
                        onMouseEnter={() => setHoveredCell({ code: row.code, model, score })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        <div 
                          className={`h-8 rounded-md flex items-center justify-center transition-all duration-300 ${isHovered ? 'ring-2 ring-primary/20 scale-105 z-10 relative' : 'opacity-90'}`}
                          style={{ backgroundColor: scoreToColor(score) }}
                        >
                          {isHovered && (
                            <span className="text-[10px] font-bold text-on-surface-variant drop-shadow-sm transition-all animate-in fade-in zoom-in duration-200">
                              {isNaN(score) ? '—' : score.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.length > showCount && !searchTerm && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <button
              className="px-6 py-2.5 bg-surface-container-highest text-[10px] font-bold text-primary uppercase tracking-widest rounded-full hover:bg-white border border-outline-variant/10 transition-all shadow-sm"
              onClick={() => setShowCount(prev => prev + 40)}
            >
              Load Additional Variants ({data.length - showCount} left)
            </button>
            <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-widest opacity-50">
               Indexed Matrix: {Math.min(showCount, data.length)} / {data.length}
            </p>
          </div>
        )}
      </div>

      {hoveredCell && (
        <div className="fixed bottom-12 right-12 bg-primary text-on-primary px-6 py-4 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex flex-col gap-1">
             <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Alignment Metric</span>
             <div className="flex items-baseline gap-3">
                <span className="text-2xl font-headline font-extrabold">{isNaN(hoveredCell.score) ? '—' : hoveredCell.score.toFixed(4)}</span>
                <span className="text-xs opacity-80 font-body">{languageNames[hoveredCell.code] || hoveredCell.code} / {hoveredCell.model}</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
