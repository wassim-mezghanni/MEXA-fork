import React, { useState, useMemo } from 'react';
import { Grid3x3, Search } from 'lucide-react';

function scoreToColor(score) {
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

export default function Heatmap({ data, languageNames, models }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCell, setHoveredCell] = useState(null);
  const [showCount, setShowCount] = useState(40);

  const displayModels = models.filter(m => m !== 'avg');

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
    <div className="glass-card card">
      <div className="section-header">
        <h3 className="flex items-center gap-2">
          <Grid3x3 size={20} className="text-blue-400" />
          Score Heatmap — Languages × Models
        </h3>
        <div className="controls-row">
          <div className="search-box">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search languages..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setShowCount(40); }}
            />
          </div>
        </div>
      </div>

      {/* Color legend */}
      <div className="heatmap-legend">
        <span className="text-xs text-slate-400">Low</span>
        <div className="legend-gradient" />
        <span className="text-xs text-slate-400">High</span>
      </div>

      <div className="heatmap-container">
        <table className="heatmap-table">
          <thead>
            <tr>
              <th className="heatmap-header-lang">Language</th>
              {displayModels.map(m => (
                <th key={m} className="heatmap-header-model">
                  <span>{m.replace('-', '\n')}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map(row => (
              <tr key={row.code}>
                <td className="heatmap-lang-cell">
                  <span className="lang-name">{languageNames[row.code] || row.code}</span>
                  <span className="lang-code">{row.code}</span>
                </td>
                {displayModels.map(model => {
                  const score = parseFloat(row[model]);
                  const isHovered = hoveredCell?.code === row.code && hoveredCell?.model === model;
                  return (
                    <td
                      key={model}
                      className={`heatmap-cell ${isHovered ? 'hovered' : ''}`}
                      style={{ backgroundColor: scoreToColor(score) }}
                      onMouseEnter={() => setHoveredCell({ code: row.code, model, score })}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      {isHovered && (
                        <span className="cell-value">{isNaN(score) ? '—' : score.toFixed(3)}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > showCount && !searchTerm && (
        <button
          className="btn-secondary"
          style={{ margin: '1rem auto', display: 'block' }}
          onClick={() => setShowCount(prev => prev + 40)}
        >
          Show more ({data.length - showCount} remaining)
        </button>
      )}

      {hoveredCell && (
        <div className="heatmap-info">
          <strong>{languageNames[hoveredCell.code] || hoveredCell.code}</strong>
          {' on '}
          <strong>{hoveredCell.model}</strong>
          {': '}
          <span style={{ color: '#60a5fa' }}>
            {isNaN(hoveredCell.score) ? '—' : hoveredCell.score.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
}
