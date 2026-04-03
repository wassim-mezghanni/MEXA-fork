import { useState, useEffect, useMemo } from 'react';
import { KPICard } from '../charts/KPICard';
import { BarChart } from '../charts/BarChart';
import { LineChart } from '../charts/LineChart';
import { DataTable } from '../charts/DataTable';
import { LanguageCard } from '../ui/LanguageCard';
import { StatCard } from '../ui/StatCard';

/* ── CSV parser ── */
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  const models = headers.slice(1);
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const row = { code: cols[0] };
    for (let j = 1; j < cols.length; j++) {
      row[models[j - 1]] = parseFloat(cols[j]) || 0;
    }
    data.push(row);
  }
  return { models, data };
}

/* ── Color helpers ── */
function scoreColor(score) {
  if (score >= 0.7) return '#004655';
  if (score >= 0.4) return '#13677b';
  if (score >= 0.2) return '#8bd1e8';
  return '#ba1a1a';
}

function scoreBg(score) {
  if (score >= 0.7) return 'bg-primary';
  if (score >= 0.4) return 'bg-primary/60';
  if (score >= 0.2) return 'bg-primary/30';
  return 'bg-error/60';
}

function scoreTier(score) {
  if (score >= 0.7) return { label: 'High', level: 'high' };
  if (score >= 0.4) return { label: 'Medium', level: 'medium' };
  return { label: 'Low', level: 'low' };
}

/* ── Constants ── */
const DATASET_OPTIONS = [
  { key: 'flores', label: 'FLORES-200', icon: 'public' },
  { key: 'bible', label: 'Bible Corpus', icon: 'menu_book' },
];

const METRIC_OPTIONS = [
  { key: 'belebele', label: 'Belebele (Max)', icon: 'quiz' },
  { key: 'arc', label: 'ARC (Mean)', icon: 'psychology' },
];

const MODEL_COLORS = {
  'gemma2-9B': '#004655',
  'gemma-7B': '#005f73',
  'llama3.1-70B': '#0a9396',
  'llama3.1-8B': '#94d2bd',
  'llama3-8B': '#e9d8a6',
  'llama2-7B': '#ee9b00',
  'llama1-7B': '#ca6702',
  'mistral-7B': '#bb3e03',
  'olmo-7B': '#ae2012',
};

const DISPLAY_MODELS = ['gemma2-9B', 'gemma-7B', 'llama3.1-70B', 'llama3.1-8B', 'llama3-8B', 'llama2-7B', 'llama1-7B', 'mistral-7B', 'olmo-7B'];

/* ── Heatmap cell color ── */
function heatmapColor(value) {
  if (value <= 0) return 'rgba(231,232,233,1)';
  if (value < 0.2) return 'rgba(185,201,207,1)';
  if (value < 0.4) return 'rgba(139,209,232,1)';
  if (value < 0.6) return 'rgba(19,103,123,1)';
  if (value < 0.8) return 'rgba(0,95,115,1)';
  return 'rgba(0,70,85,1)';
}

function heatmapTextColor(value) {
  return value > 0.35 ? 'text-white' : 'text-on-surface';
}

/* ── Main Page Component ── */
export default function MexaFindings() {
  const [dataset, setDataset] = useState('flores');
  const [metric, setMetric] = useState('belebele');
  const [allData, setAllData] = useState(null);
  const [languageNames, setLanguageNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [heatmapCount, setHeatmapCount] = useState(30);

  /* ── Load data ── */
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [langNames, fmb, fma, bmb, bma] = await Promise.all([
          fetch('/data/language_names.json').then(r => r.json()),
          fetch('/data/flores-max-belebele.csv').then(r => r.text()),
          fetch('/data/flores-mean-arc.csv').then(r => r.text()),
          fetch('/data/bible-max-belebele.csv').then(r => r.text()),
          fetch('/data/bible-mean-arc.csv').then(r => r.text()),
        ]);

        const parsed = {
          'flores-belebele': parseCSV(fmb),
          'flores-arc': parseCSV(fma),
          'bible-belebele': parseCSV(bmb),
          'bible-arc': parseCSV(bma),
        };

        // Build language name map
        const nameMap = {};
        Object.values(parsed).forEach(({ data }) => {
          data.forEach(row => {
            const iso = row.code.split('_')[0];
            nameMap[row.code] = langNames[iso] || row.code;
          });
        });

        setLanguageNames(nameMap);
        setAllData(parsed);
      } catch (err) {
        console.error('Failed to load MEXA data:', err);
      }
      setLoading(false);
    }
    load();
  }, []);

  /* ── Active dataset ── */
  const activeKey = `${dataset}-${metric}`;
  const active = allData?.[activeKey];
  const activeData = active?.data || [];
  const activeModels = active?.models?.filter(m => m !== 'avg') || [];

  /* ── Computed stats ── */
  const stats = useMemo(() => {
    if (!activeData.length) return null;

    const avgScores = activeData.map(r => r.avg || 0);
    const totalLangs = activeData.length;
    const globalAvg = avgScores.reduce((a, b) => a + b, 0) / totalLangs;

    // Best model (highest mean across languages)
    const modelAvgs = {};
    activeModels.forEach(m => {
      const scores = activeData.map(r => r[m] || 0);
      modelAvgs[m] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });
    const bestModel = Object.entries(modelAvgs).sort((a, b) => b[1] - a[1])[0];

    // Top language
    const topLang = activeData.reduce((best, row) => (row.avg > best.avg ? row : best), activeData[0]);

    // Bottom language
    const bottomLang = activeData.reduce((worst, row) => (row.avg < worst.avg ? row : worst), activeData[0]);

    // High/medium/low counts
    const high = activeData.filter(r => r.avg >= 0.5).length;
    const medium = activeData.filter(r => r.avg >= 0.2 && r.avg < 0.5).length;
    const low = activeData.filter(r => r.avg < 0.2).length;

    return { totalLangs, globalAvg, bestModel, topLang, bottomLang, modelAvgs, high, medium, low };
  }, [activeData, activeModels]);

  /* ── Model bar chart data ── */
  const modelBarData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.modelAvgs)
      .map(([model, avg]) => ({ model, score: parseFloat(avg.toFixed(4)) }))
      .sort((a, b) => b.score - a.score);
  }, [stats]);

  /* ── Score distribution (binned) ── */
  const distributionData = useMemo(() => {
    if (!activeData.length) return [];
    const bins = Array.from({ length: 10 }, (_, i) => ({
      range: `${(i / 10).toFixed(1)}-${((i + 1) / 10).toFixed(1)}`,
      count: 0,
    }));
    activeData.forEach(row => {
      const idx = Math.min(Math.floor((row.avg || 0) * 10), 9);
      bins[idx].count++;
    });
    return bins;
  }, [activeData]);

  /* ── Top/bottom language cards ── */
  const featuredLanguages = useMemo(() => {
    if (!activeData.length) return [];
    const sorted = [...activeData].sort((a, b) => (b.avg || 0) - (a.avg || 0));
    const top3 = sorted.slice(0, 3);
    const bottom3 = sorted.slice(-3).reverse();
    return [...top3, ...bottom3].map(row => ({
      code: row.code,
      name: languageNames[row.code] || row.code,
      family: row.code.includes('_') ? row.code.split('_')[1] : undefined,
      script: row.code.includes('_') ? row.code.split('_')[1] : undefined,
      resourceLevel: scoreTier(row.avg).level,
      scores: activeModels.slice(0, 3).map(m => ({ model: m, score: row[m] || 0 })),
      avgScore: row.avg || 0,
    }));
  }, [activeData, activeModels, languageNames]);

  /* ── DataTable columns ── */
  const tableColumns = useMemo(() => {
    const cols = [
      {
        key: 'rank',
        label: '#',
        align: 'center',
        sortable: true,
        render: (val) => (
          <span className="text-xs font-mono font-bold text-on-surface-variant">{val}</span>
        ),
      },
      {
        key: 'name',
        label: 'Language',
        sortable: true,
        filterable: true,
        render: (val, row) => (
          <div>
            <span className="font-headline font-bold text-sm text-on-surface">{val}</span>
            <span className="block font-mono text-[10px] text-on-surface-variant">{row.code}</span>
          </div>
        ),
      },
      ...activeModels.map(m => ({
        key: m,
        label: m,
        align: 'center',
        sortable: true,
        render: (val) => {
          const v = typeof val === 'number' ? val : parseFloat(val) || 0;
          return (
            <div className="flex items-center justify-center gap-2">
              <div className="w-12 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${v * 100}%`, backgroundColor: scoreColor(v) }}
                />
              </div>
              <span className="text-xs font-mono font-medium" style={{ color: scoreColor(v) }}>
                {v.toFixed(3)}
              </span>
            </div>
          );
        },
      })),
      {
        key: 'avg',
        label: 'Average',
        align: 'center',
        sortable: true,
        render: (val) => {
          const v = typeof val === 'number' ? val : parseFloat(val) || 0;
          return (
            <span className="text-sm font-headline font-extrabold" style={{ color: scoreColor(v) }}>
              {v.toFixed(4)}
            </span>
          );
        },
      },
    ];
    return cols;
  }, [activeModels]);

  /* ── DataTable rows ── */
  const tableData = useMemo(() => {
    const sorted = [...activeData].sort((a, b) => (b.avg || 0) - (a.avg || 0));
    return sorted.map((row, idx) => ({
      rank: idx + 1,
      code: row.code,
      name: languageNames[row.code] || row.code,
      ...Object.fromEntries(activeModels.map(m => [m, row[m] || 0])),
      avg: row.avg || 0,
    }));
  }, [activeData, activeModels, languageNames]);

  /* ── Loading state ── */
  if (loading || !allData) {
    return (
      <div className="p-12 space-y-8 animate-pulse">
        <div className="h-12 w-96 bg-surface-container-low rounded-lg" />
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 bg-surface-container-low rounded-xl" />
          ))}
        </div>
        <div className="h-96 bg-surface-container-low rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-12 space-y-12">
      {/* ── Page Header ── */}
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-3">
          <span className="material-symbols-outlined text-3xl text-primary">science</span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            ACL 2025 Findings
          </span>
        </div>
        <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight mb-4">
          MEXA: Paper Results
        </h2>
        <p className="text-on-surface-variant font-body leading-relaxed max-w-2xl italic">
          Multilingual Evaluation of Cross-lingual Alignment across 9 LLMs.
          Measuring how well models align internal representations of parallel sentences
          across languages using cosine similarity of weighted hidden-state embeddings.
        </p>
      </div>

      {/* ── Dataset & Metric Toggles ── */}
      <div className="flex flex-wrap gap-4">
        {/* Dataset toggle */}
        <div className="bg-surface-container-low rounded-xl p-1.5 flex gap-1">
          {DATASET_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => { setDataset(opt.key); setHeatmapCount(30); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-headline font-bold tracking-tight transition-all ${
                dataset === opt.key
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Metric toggle */}
        <div className="bg-surface-container-low rounded-xl p-1.5 flex gap-1">
          {METRIC_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setMetric(opt.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-headline font-bold tracking-tight transition-all ${
                metric === opt.key
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Languages"
            value={stats.totalLangs}
            icon="translate"
            description={
              <span>
                <strong>{stats.high}</strong> high, <strong>{stats.medium}</strong> medium, <strong>{stats.low}</strong> low alignment
              </span>
            }
          />
          <KPICard
            title="Best Model"
            value={stats.bestModel[0]}
            icon="emoji_events"
            description={
              <span>
                Mean MEXA score <strong>{stats.bestModel[1].toFixed(4)}</strong> across all languages
              </span>
            }
          />
          <KPICard
            title="Top Language"
            value={languageNames[stats.topLang.code] || stats.topLang.code}
            icon="star"
            description={
              <span>
                Average alignment score of <strong>{(stats.topLang.avg || 0).toFixed(4)}</strong>
              </span>
            }
          />
          <KPICard
            title="Global Average"
            value={stats.globalAvg.toFixed(4)}
            icon="analytics"
            description={
              <span>
                Mean MEXA alignment across all {stats.totalLangs} languages and 9 models
              </span>
            }
          />
        </div>
      )}

      {/* ── Bento Grid ── */}
      <div className="grid grid-cols-12 gap-8">

        {/* ── Model Performance Bar Chart ── */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container-low p-8 rounded-xl">
          <div className="mb-8">
            <h3 className="text-lg font-headline font-bold text-primary mb-1 uppercase tracking-wider">
              Model Performance Ranking
            </h3>
            <p className="text-xs text-on-surface-variant font-label">
              Average MEXA alignment score per model across all {stats?.totalLangs || 0} languages
            </p>
          </div>
          <BarChart
            data={modelBarData}
            categoryKey="model"
            series={[{ key: 'score', color: '#004655', name: 'MEXA Score' }]}
            layout="vertical"
            height={380}
            valueFormatter={(v) => v.toFixed(3)}
          />
        </div>

        {/* ── Score Distribution ── */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-low p-8 rounded-xl">
          <div className="mb-8">
            <h3 className="text-lg font-headline font-bold text-primary mb-1 uppercase tracking-wider">
              Score Distribution
            </h3>
            <p className="text-xs text-on-surface-variant font-label">
              Distribution of average MEXA scores across languages
            </p>
          </div>
          <LineChart
            data={distributionData}
            xAxisKey="range"
            series={[{ key: 'count', color: '#004655', name: 'Languages' }]}
            height={340}
            yAxisFormatter={(v) => String(Math.round(v))}
          />
          {stats && (
            <div className="grid grid-cols-3 gap-3 mt-6">
              <StatCard label="High (>0.5)" value={stats.high} accentColor="border-primary" valueColor="text-primary" />
              <StatCard label="Medium" value={stats.medium} accentColor="border-tertiary" valueColor="text-tertiary" />
              <StatCard label="Low (<0.2)" value={stats.low} accentColor="border-error" valueColor="text-error" />
            </div>
          )}
        </div>

        {/* ── Heatmap: Languages x Models ── */}
        <div className="col-span-12 bg-surface-container-low p-8 rounded-xl overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-headline font-bold text-primary mb-1 uppercase tracking-wider">
                Cross-Lingual Alignment Heatmap
              </h3>
              <p className="text-xs text-on-surface-variant font-label">
                MEXA scores per language and model — ranked by average score (top {Math.min(heatmapCount, activeData.length)} of {activeData.length})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">Low</span>
              <div
                className="h-2.5 w-32 rounded-full"
                style={{ background: 'linear-gradient(90deg, #e7e8e9, #b9c9cf, #8bd1e8, #13677b, #005f73, #004655)' }}
              />
              <span className="text-[9px] uppercase tracking-widest text-on-surface-variant font-bold">High</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="border-collapse w-full">
              <thead>
                <tr>
                  <th className="text-left text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant pb-3 pr-4 w-40 min-w-40">#</th>
                  <th className="text-left text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant pb-3 pr-4 w-40 min-w-40">Language</th>
                  {DISPLAY_MODELS.map(m => (
                    <th key={m} className="text-center text-[9px] font-bold uppercase tracking-wider text-on-surface-variant pb-3 px-0.5 min-w-14">
                      <span className="block whitespace-nowrap">{m}</span>
                    </th>
                  ))}
                  <th className="text-center text-xs font-headline font-bold uppercase tracking-wider text-primary pb-3 pl-2 min-w-16">Avg</th>
                </tr>
              </thead>
              <tbody>
                {[...activeData]
                  .sort((a, b) => (b.avg || 0) - (a.avg || 0))
                  .slice(0, heatmapCount)
                  .map((row, idx) => (
                    <tr key={row.code} className="group">
                      <td className="text-xs font-mono text-on-surface-variant py-0.5 pr-4 group-hover:text-primary transition-colors">
                        {idx + 1}
                      </td>
                      <td className="text-xs font-medium text-on-surface py-0.5 pr-4 group-hover:text-primary transition-colors">
                        <div className="flex flex-col">
                          <span className="font-bold">{languageNames[row.code] || row.code}</span>
                          <span className="font-mono text-[9px] text-on-surface-variant">{row.code}</span>
                        </div>
                      </td>
                      {DISPLAY_MODELS.map(m => {
                        const v = row[m] || 0;
                        return (
                          <td
                            key={m}
                            className="text-center py-0.5 px-0.5"
                            title={`${languageNames[row.code] || row.code} / ${m}: ${v.toFixed(4)}`}
                          >
                            <div
                              className={`h-7 rounded-[2px] flex items-center justify-center transition-all hover:scale-110 hover:z-10 hover:shadow-lg ${heatmapTextColor(v)}`}
                              style={{ backgroundColor: heatmapColor(v) }}
                            >
                              <span className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                {v.toFixed(2)}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                      <td className="text-center py-0.5 pl-2">
                        <span className="text-sm font-headline font-extrabold" style={{ color: scoreColor(row.avg || 0) }}>
                          {(row.avg || 0).toFixed(3)}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {activeData.length > heatmapCount && (
            <button
              onClick={() => setHeatmapCount(prev => prev + 30)}
              className="mt-4 mx-auto block text-[10px] font-bold uppercase tracking-widest py-2 px-6 rounded bg-surface-container-lowest text-on-surface-variant hover:bg-white hover:text-primary transition-colors"
            >
              Show more ({activeData.length - heatmapCount} remaining)
            </button>
          )}
        </div>

        {/* ── Featured Language Cards ── */}
        <div className="col-span-12">
          <h3 className="text-lg font-headline font-bold text-primary mb-2 uppercase tracking-wider">
            Featured Languages
          </h3>
          <p className="text-xs text-on-surface-variant font-label mb-6">
            Top 3 and bottom 3 performing languages by average MEXA score
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {featuredLanguages.map((lang, idx) => (
              <div key={lang.code} className="relative">
                {idx < 3 && (
                  <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center z-10 shadow-md">
                    {idx + 1}
                  </div>
                )}
                {idx >= 3 && (
                  <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center z-10 shadow-md">
                    <span className="material-symbols-outlined text-xs">arrow_downward</span>
                  </div>
                )}
                <LanguageCard {...lang} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Full Data Table ── */}
        <div className="col-span-12">
          <DataTable
            title="Complete MEXA Alignment Scores"
            subtitle={`${dataset === 'flores' ? 'FLORES-200' : 'Bible'} Corpus / ${metric === 'belebele' ? 'Belebele' : 'ARC'} Benchmark`}
            columns={tableColumns}
            data={tableData}
            rowsPerPage={15}
            enableSearch
            searchPlaceholder="Search by language name or code..."
            enableSorting
            enableExport
            exportFilename={`mexa-${activeKey}`}
            enableDensityToggle
          />
        </div>
      </div>
    </div>
  );
}
