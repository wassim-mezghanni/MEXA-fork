import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Search } from 'lucide-react';

const SCORE_COLORS = [
  '#22c55e', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
  '#ef4444', '#f97316', '#eab308', '#84cc16',
];

function getBarColor(score) {
  if (score >= 0.85) return '#22c55e';
  if (score >= 0.7) return '#3b82f6';
  if (score >= 0.55) return '#eab308';
  if (score >= 0.4) return '#f97316';
  return '#ef4444';
}

export default function ScoreRanking({ data, languageNames, models }) {
  const [selectedModel, setSelectedModel] = useState(models[0] || 'avg');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCount, setShowCount] = useState(30);

  const sortedData = useMemo(() => {
    return data
      .map(row => ({
        code: row.code,
        name: languageNames[row.code] || row.code,
        score: parseFloat(row[selectedModel]) || 0,
      }))
      .filter(d => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q);
      })
      .sort((a, b) => b.score - a.score);
  }, [data, selectedModel, languageNames, searchTerm]);

  const displayData = sortedData.slice(0, showCount);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const d = payload[0].payload;
    return (
      <div className="chart-tooltip">
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{d.name}</p>
        <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{d.code}</p>
        <p style={{ color: getBarColor(d.score), fontWeight: 700, fontSize: '1.1rem' }}>
          {d.score.toFixed(4)}
        </p>
      </div>
    );
  };

  return (
    <div className="glass-card card" style={{ minHeight: 600 }}>
      <div className="section-header">
        <h3 className="flex items-center gap-2">
          <Trophy size={20} className="text-blue-400" />
          Language Rankings — {selectedModel}
        </h3>
        <div className="controls-row">
          <div className="search-box">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search languages..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            className="select-control"
          >
            {models.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ width: '100%', height: Math.max(400, displayData.length * 28) }}>
        <ResponsiveContainer>
          <BarChart data={displayData} layout="vertical" margin={{ left: 120, right: 30, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3f" horizontal={false} />
            <XAxis type="number" domain={[0, 1]} stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis
              dataKey="name"
              type="category"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={110}
              tick={{ fill: '#94a3b8' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={18}>
              {displayData.map((entry, idx) => (
                <Cell key={idx} fill={getBarColor(entry.score)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {sortedData.length > showCount && (
        <button
          className="btn-secondary"
          style={{ margin: '1rem auto', display: 'block' }}
          onClick={() => setShowCount(prev => prev + 30)}
        >
          Show more ({sortedData.length - showCount} remaining)
        </button>
      )}

      <p className="text-xs text-slate-500" style={{ textAlign: 'center', marginTop: 8 }}>
        Showing {Math.min(showCount, sortedData.length)} of {sortedData.length} languages
      </p>
    </div>
  );
}
