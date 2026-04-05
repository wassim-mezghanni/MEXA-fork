import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ModelResult } from './Heatmap';

interface ModelComparisonProps {
  data: ModelResult[];
  languageNames: Record<string, string>;
  models: string[];
}

const MODEL_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#a855f7', '#14b8a6',
];

interface ChartRow {
  model: string;
  [langCode: string]: number | string;
}

export default function ModelComparison({ data, languageNames, models }: ModelComparisonProps) {
  const [activeLangs, setActiveLangs] = useState<string[]>(['hin_Deva', 'fra_Latn', 'yor_Latn']);
  const [searchTerm, setSearchTerm] = useState('');

  const displayModels = useMemo(() => models.filter(m => m !== 'avg'), [models]);

  const chartData = useMemo<ChartRow[]>(() => {
    return displayModels.map(m => {
      const row: ChartRow = { model: m };
      activeLangs.forEach(langCode => {
        const langData = data.find(d => d.code === langCode);
        row[langCode] = langData ? (parseFloat(langData[m] as string) || 0) : 0;
      });
      return row;
    });
  }, [data, displayModels, activeLangs]);

  const availableLangs = useMemo(() => {
    return data.map(d => ({
      code: d.code,
      name: languageNames[d.code] || d.code,
    }));
  }, [data, languageNames]);

  const filteredAvailable = useMemo(() => {
    if (!searchTerm) return availableLangs.slice(0, 50);
    const q = searchTerm.toLowerCase();
    return availableLangs.filter(l => 
      l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q)
    );
  }, [availableLangs, searchTerm]);

  const toggleLang = (code: string) => {
    setActiveLangs(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-surface-container-highest/90 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-xl animate-in fade-in zoom-in duration-300">
        <p className="font-headline font-bold text-sm text-primary mb-3 uppercase tracking-wider">{label}</p>
        <div className="space-y-2">
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex justify-between items-center gap-4 text-xs font-body">
              <span className="text-on-surface-variant flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                {languageNames[p.dataKey] || p.dataKey}
              </span>
              <span className="font-mono font-bold text-on-surface">{(p.value as number).toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-surface-container-low p-10 rounded-2xl relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 group">
      {/* Subtle Accent Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 relative z-10">
        <div>
          <h3 className="text-xl font-headline font-extrabold text-primary mb-1 uppercase tracking-widest flex items-center gap-3">
            <span className="icon text-primary/70">compare_arrows</span>
            Model Comparison
          </h3>
          <p className="text-xs text-on-surface-variant font-label uppercase tracking-[0.1em] opacity-70">
            Cross-Model Delta Variance per Language
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface-container-lowest/50 p-1.5 rounded-xl border border-outline-variant/10 backdrop-blur-sm">
          <div className="relative">
            <span className="icon absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 text-sm">search</span>
            <input
              type="text"
              placeholder="Add languages..."
              className="pl-9 pr-4 py-2 bg-transparent text-xs font-label text-on-surface placeholder:text-on-surface-variant/40 outline-none w-48"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 relative z-10">
        {/* Sidebar: Selection & Context */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Selected Cohort</h4>
            <div className="flex flex-wrap gap-2">
              {activeLangs.map(code => (
                <button 
                  key={code} 
                  onClick={() => toggleLang(code)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary rounded-lg hover:bg-primary/20 transition-all group/btn"
                >
                  {languageNames[code] || code}
                  <span className="icon text-[12px] opacity-40 group-hover/btn:opacity-100">close</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-outline-variant/10">
             <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Available Languages</h4>
             <div className="max-h-[280px] overflow-y-auto pr-2 custom-scrollbar space-y-1">
                {filteredAvailable
                  .filter(l => !activeLangs.includes(l.code))
                  .map(l => (
                    <button 
                      key={l.code} 
                      onClick={() => toggleLang(l.code)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/50 text-[11px] text-on-surface-variant hover:text-primary transition-all text-left border border-transparent hover:border-outline-variant/10"
                    >
                      <span className="font-medium">{l.name}</span>
                      <span className="font-mono text-[9px] opacity-40">{l.code}</span>
                    </button>
                  ))}
             </div>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="col-span-12 lg:col-span-9 bg-surface-container-lowest/30 rounded-2xl p-6 border border-outline-variant/10 min-h-[450px]">
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e4" vertical={false} opacity={0.5} />
              <XAxis 
                dataKey="model" 
                stroke="#3f484c" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tick={{ fontStyle: 'italic', fontWeight: 600 } as any}
                dy={10}
              />
              <YAxis 
                domain={[0, 1]} 
                stroke="#3f484c" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(v: number) => v.toFixed(1)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 70, 85, 0.05)' }} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingTop: 0, paddingBottom: 30, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}
                formatter={(value: string) => <span className="text-on-surface-variant">{languageNames[value] || value}</span>}
              />
              {activeLangs.map((code, idx) => (
                <Bar
                  key={code}
                  dataKey={code}
                  fill={MODEL_COLORS[idx % MODEL_COLORS.length]}
                  radius={[4, 4, 0, 0]}
                  barSize={idx === 0 ? 32 : 18}
                  fillOpacity={0.85}
                  className="transition-all duration-300"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
