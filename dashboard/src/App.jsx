import React, { useState, useEffect, useMemo } from 'react';
import { Globe, Layers, BarChart3, Settings, Info, ChevronRight, Database, Sliders, Grid3x3, Trophy, GitCompare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ScoreRanking from './components/ScoreRanking';
import ModelComparison from './components/ModelComparison';
import Heatmap from './components/Heatmap';

const DATASETS = [
  { key: 'flores', label: 'FLORES-200' },
  { key: 'bible', label: 'Bible' },
];

const AGGREGATIONS = [
  { key: 'max', label: 'Max', eval: 'belebele' },
  { key: 'mean', label: 'Mean', eval: 'arc' },
];

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  const models = headers.slice(1);
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const row = { code: cols[0] };
    for (let j = 1; j < cols.length; j++) {
      row[models[j - 1]] = cols[j];
    }
    data.push(row);
  }
  return { models, data };
}

const TABS = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'rankings', label: 'Rankings', icon: Trophy },
  { key: 'comparison', label: 'Model Comparison', icon: GitCompare },
  { key: 'heatmap', label: 'Heatmap', icon: Grid3x3 },
];

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dataset, setDataset] = useState('flores');
  const [aggregation, setAggregation] = useState('max');
  const [languageNames, setLanguageNames] = useState({});
  const [allData, setAllData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [langNamesRes, fmb, fma, bmb, bma] = await Promise.all([
          fetch('/data/language_names.json').then(r => r.json()),
          fetch('/data/flores-max-belebele.csv').then(r => r.text()),
          fetch('/data/flores-mean-arc.csv').then(r => r.text()),
          fetch('/data/bible-max-belebele.csv').then(r => r.text()),
          fetch('/data/bible-mean-arc.csv').then(r => r.text()),
        ]);
        // Build FLORES code → human name mapping
        // language_names.json uses 3-letter ISO 639-3 codes (e.g., "eng" → "English")
        // CSV data uses FLORES codes (e.g., "eng_Latn")
        // Extract the ISO prefix from the FLORES code to look up the name
        const floresNameMap = {};
        const allCsvTexts = [fmb, fma, bmb, bma];
        const allFloresCodes = new Set();
        allCsvTexts.forEach(csv => {
          csv.trim().split('\n').slice(1).forEach(line => {
            const code = line.split(',')[0];
            if (code) allFloresCodes.add(code);
          });
        });
        allFloresCodes.forEach(floresCode => {
          const isoCode = floresCode.split('_')[0]; // e.g., "eng" from "eng_Latn"
          const scriptPart = floresCode.split('_').slice(1).join('_'); // e.g., "Latn"
          const baseName = langNamesRes[isoCode];
          if (baseName) {
            floresNameMap[floresCode] = baseName;
          } else {
            floresNameMap[floresCode] = floresCode; // fallback to code
          }
        });
        setLanguageNames(floresNameMap);
        setAllData({
          'flores-max': parseCSV(fmb),
          'flores-mean': parseCSV(fma),
          'bible-max': parseCSV(bmb),
          'bible-mean': parseCSV(bma),
        });
      } catch (err) {
        console.error('Failed to load data:', err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const dataKey = `${dataset}-${aggregation}`;
  const currentData = allData[dataKey];
  const evalTask = aggregation === 'max' ? 'Belebele' : 'ARC';

  const stats = useMemo(() => {
    if (!currentData) return {};
    const { data, models } = currentData;
    const numLangs = data.length;
    const numModels = models.filter(m => m !== 'avg').length;
    const allScores = data.flatMap(r => models.filter(m => m !== 'avg').map(m => parseFloat(r[m]) || 0));
    const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;

    // Top 5 and bottom 5 by avg
    const ranked = data
      .map(r => ({ code: r.code, score: parseFloat(r.avg) || 0 }))
      .sort((a, b) => b.score - a.score);

    return { numLangs, numModels, avgScore, top5: ranked.slice(0, 5), bottom5: ranked.slice(-5).reverse() };
  }, [currentData]);

  if (loading) {
    return (
      <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="loading-spinner">
          <Globe size={48} className="spin" />
          <p>Loading MEXA data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="title-group">
          <h1>MEXA Dashboard</h1>
          <p>Multilingual Evaluation via Cross-Lingual Alignment</p>
        </div>
      </header>

      {/* Control Bar */}
      <div className="control-bar glass-card">
        <div className="control-group">
          <label><Database size={14} /> Dataset</label>
          <div className="toggle-group">
            {DATASETS.map(d => (
              <button
                key={d.key}
                className={`toggle-btn ${dataset === d.key ? 'active' : ''}`}
                onClick={() => setDataset(d.key)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <label><Sliders size={14} /> Aggregation</label>
          <div className="toggle-group">
            {AGGREGATIONS.map(a => (
              <button
                key={a.key}
                className={`toggle-btn ${aggregation === a.key ? 'active' : ''}`}
                onClick={() => setAggregation(a.key)}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div className="control-info">
          <span className="badge">{stats.numLangs} languages</span>
          <span className="badge">{stats.numModels} models</span>
          <span className="badge">Eval: {evalTask}</span>
        </div>
      </div>

      {/* Tabs */}
      <nav className="tab-nav">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + dataKey}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && currentData && (
            <div className="overview-content">
              <div className="stats-grid">
                <div className="glass-card card stat-item">
                  <div className="stat-value">{stats.numLangs}</div>
                  <div className="stat-label">Languages</div>
                </div>
                <div className="glass-card card stat-item">
                  <div className="stat-value">{stats.numModels}</div>
                  <div className="stat-label">Models</div>
                </div>
                <div className="glass-card card stat-item">
                  <div className="stat-value">{stats.avgScore?.toFixed(3)}</div>
                  <div className="stat-label">Avg Score</div>
                </div>
                <div className="glass-card card stat-item">
                  <div className="stat-value">{evalTask}</div>
                  <div className="stat-label">Eval Task</div>
                </div>
              </div>

              <div className="overview-grid">
                <div className="glass-card card">
                  <h4 className="flex items-center gap-2" style={{ color: '#22c55e' }}>
                    <Trophy size={16} /> Top Performing Languages
                  </h4>
                  <div className="ranked-list">
                    {stats.top5?.map((item, i) => (
                      <div key={item.code} className="ranked-item">
                        <span className="rank">#{i + 1}</span>
                        <span className="lang">{languageNames[item.code] || item.code}</span>
                        <span className="code">{item.code}</span>
                        <span className="score" style={{ color: '#22c55e' }}>{item.score.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card card">
                  <h4 className="flex items-center gap-2" style={{ color: '#f97316' }}>
                    <BarChart3 size={16} /> Lowest Performing Languages
                  </h4>
                  <div className="ranked-list">
                    {stats.bottom5?.map((item, i) => (
                      <div key={item.code} className="ranked-item">
                        <span className="rank">#{stats.numLangs - 4 + i}</span>
                        <span className="lang">{languageNames[item.code] || item.code}</span>
                        <span className="code">{item.code}</span>
                        <span className="score" style={{ color: '#f97316' }}>{item.score.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card card" style={{ gridColumn: '1 / -1' }}>
                  <h4 className="flex items-center gap-2">
                    <Info size={16} className="text-blue-400" /> About this view
                  </h4>
                  <p className="text-sm text-slate-400" style={{ marginTop: 8, lineHeight: 1.7 }}>
                    Showing <strong>{dataset === 'flores' ? 'FLORES-200' : 'Bible'}</strong> dataset scores using <strong>{aggregation}</strong> pooling across layers, evaluated on <strong>{evalTask}</strong>.
                    MEXA estimates multilingual capabilities by measuring how well non-English tokens align with English pivot representations in intermediate layers of LLMs.
                    Use the tabs above to explore rankings, compare models, or view the full heatmap.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rankings' && currentData && (
            <ScoreRanking
              data={currentData.data}
              languageNames={languageNames}
              models={currentData.models}
            />
          )}

          {activeTab === 'comparison' && currentData && (
            <ModelComparison
              data={currentData.data}
              languageNames={languageNames}
              models={currentData.models}
            />
          )}

          {activeTab === 'heatmap' && currentData && (
            <Heatmap
              data={currentData.data}
              languageNames={languageNames}
              models={currentData.models}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
