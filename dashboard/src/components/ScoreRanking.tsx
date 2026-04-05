import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { ModelResult } from './Heatmap';

interface ScoreRankingProps {
  data: ModelResult[];
  languageNames: Record<string, string>;
  models: string[];
}

function getBarColor(score: number): string {
  if (score >= 0.85) return '#22c55e';
  if (score >= 0.7) return '#3b82f6';
  if (score >= 0.55) return '#eab308';
  if (score >= 0.4) return '#f97316';
  return '#ef4444';
}

interface RankedItem {
  code: string;
  name: string;
  score: number;
}

export default function ScoreRanking({ data, languageNames, models }: ScoreRankingProps) {
  const [selectedModel, setSelectedModel] = useState(models[0] || 'avg');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCount, setShowCount] = useState(30);

  const sortedData = useMemo<RankedItem[]>(() => {
    return data
      .map(row => ({
        code: row.code,
        name: languageNames[row.code] || row.code,
        score: parseFloat(row[selectedModel] as string) || 0,
      }))
      .filter(d => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q);
      })
      .sort((a, b) => b.score - a.score);
  }, [data, selectedModel, languageNames, searchTerm]);

  const displayData = useMemo(() => sortedData.slice(0, showCount), [sortedData, showCount]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload as RankedItem;
    return (
      <div className="bg-surface-container-highest/90 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-xl animate-in fade-in zoom-in duration-300 min-w-[140px]">
        <p className="font-headline font-bold text-xs text-primary mb-1 uppercase tracking-tight">{d.name}</p>
        <p className="text-[10px] text-on-surface-variant font-mono opacity-50 mb-3">{d.code}</p>
        <div className="flex items-baseline gap-2">
           <span className="text-xl font-bold font-headline" style={{ color: getBarColor(d.score) }}>
             {d.score.toFixed(4) }
           </span>
           <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">Alignment</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-surface-container-low p-10 rounded-2xl relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 group">
      {/* Background Accent */}
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-tertiary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 relative z-10">
        <div>
          <h3 className="text-xl font-headline font-extrabold text-primary mb-1 uppercase tracking-widest flex items-center gap-3">
            <span className="icon text-primary/70">emoji_events</span>
            Language Rankings
          </h3>
          <p className="text-xs text-on-surface-variant font-label uppercase tracking-[0.1em] opacity-70">
            Performance Hierarchy: {selectedModel}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface-container-lowest/50 p-1.5 rounded-xl border border-outline-variant/10 backdrop-blur-sm">
          <div className="relative">
            <span className="icon absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 text-sm">search</span>
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 bg-transparent text-xs font-label text-on-surface placeholder:text-on-surface-variant/40 outline-none w-40"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="h-6 w-[1px] bg-outline-variant/20 mx-1"></div>
          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            className="pr-8 pl-3 py-2 bg-transparent text-[10px] font-bold text-primary uppercase tracking-widest outline-none cursor-pointer hover:bg-white/50 rounded-lg transition-colors appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' height=\'16\' width=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23004655\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
          >
            {models.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-surface-container-lowest/30 rounded-2xl p-6 border border-outline-variant/10 transition-all" style={{ height: Math.max(450, displayData.length * 32) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} layout="vertical" margin={{ left: 100, right: 30, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e4" horizontal={false} opacity={0.5} />
            <XAxis 
              type="number" 
              domain={[0, 1]} 
              stroke="#3f484c" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(v: number) => v.toFixed(1)}
            />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#3f484c"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={100}
              tick={{ fill: '#001f27', fontWeight: 600, fontSize: 10 } as any}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 70, 85, 0.05)' }} />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={18}>
              {displayData.map((entry, idx) => (
                <Cell 
                  key={idx} 
                  fill={getBarColor(entry.score)} 
                  fillOpacity={0.85} 
                  className="hover:fill-opacity-100 transition-all duration-300" 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4 relative z-10">
        {sortedData.length > showCount && (
          <button
            className="px-6 py-2.5 bg-surface-container-highest text-[10px] font-bold text-primary uppercase tracking-widest rounded-full hover:bg-white border border-outline-variant/10 transition-all shadow-sm active:scale-95"
            onClick={() => setShowCount(prev => prev + 30)}
          >
            Load Next 30 Languages ({sortedData.length - showCount} left)
          </button>
        )}
        <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-widest opacity-50">
          Showing {Math.min(showCount, sortedData.length)} of {sortedData.length} indexed variants
        </p>
      </div>
    </div>
  );
}
