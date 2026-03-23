import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GitCompare, Search } from 'lucide-react';

const MODEL_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316',
];

export default function ModelComparison({ data, languageNames, models }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLangs, setSelectedLangs] = useState([]);

  const availableLangs = useMemo(() => {
    return data.map(row => ({
      code: row.code,
      name: languageNames[row.code] || row.code,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [data, languageNames]);

  const filteredAvailable = useMemo(() => {
    if (!searchTerm) return availableLangs.slice(0, 20);
    const q = searchTerm.toLowerCase();
    return availableLangs.filter(l =>
      l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [availableLangs, searchTerm]);

  // Default to top 5 languages if none selected
  const activeLangs = selectedLangs.length > 0
    ? selectedLangs
    : data.slice(0, 5).map(r => r.code);

  const chartData = useMemo(() => {
    const displayModels = models.filter(m => m !== 'avg');
    return displayModels.map(model => {
      const row = { model };
      activeLangs.forEach(langCode => {
        const langRow = data.find(r => r.code === langCode);
        row[langCode] = langRow ? parseFloat(langRow[model]) || 0 : 0;
      });
      return row;
    });
  }, [data, models, activeLangs]);

  const toggleLang = (code) => {
    setSelectedLangs(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="chart-tooltip">
        <p style={{ fontWeight: 600, marginBottom: 6 }}>{label}</p>
        {payload.map((p, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: '0.8rem' }}>
            <span style={{ color: p.color }}>{languageNames[p.dataKey] || p.dataKey}</span>
            <span style={{ fontWeight: 600 }}>{p.value.toFixed(4)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="glass-card card" style={{ minHeight: 500 }}>
      <div className="section-header">
        <h3 className="flex items-center gap-2">
          <GitCompare size={20} className="text-blue-400" />
          Model Comparison
        </h3>
      </div>

      <div className="comparison-layout">
        <div className="lang-picker">
          <div className="search-box" style={{ marginBottom: 8 }}>
            <Search size={14} />
            <input
              type="text"
              placeholder="Add languages..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="lang-chips">
            {activeLangs.map(code => (
              <span key={code} className="lang-chip active" onClick={() => toggleLang(code)}>
                {languageNames[code] || code} ✕
              </span>
            ))}
          </div>
          <div className="lang-options">
            {filteredAvailable
              .filter(l => !activeLangs.includes(l.code))
              .map(l => (
                <div key={l.code} className="lang-option" onClick={() => toggleLang(l.code)}>
                  <span>{l.name}</span>
                  <span className="text-xs text-slate-500">{l.code}</span>
                </div>
              ))}
          </div>
        </div>

        <div style={{ flex: 1, height: 450 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ left: 10, right: 20, top: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3f" vertical={false} />
              <XAxis dataKey="model" stroke="#64748b" fontSize={11} tickLine={false} angle={-25} textAnchor="end" height={60} />
              <YAxis domain={[0, 1]} stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => languageNames[value] || value}
                wrapperStyle={{ fontSize: '0.75rem' }}
              />
              {activeLangs.map((code, idx) => (
                <Bar
                  key={code}
                  dataKey={code}
                  fill={MODEL_COLORS[idx % MODEL_COLORS.length]}
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                  fillOpacity={0.85}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
