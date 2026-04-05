import { useState, useEffect, useMemo } from 'react';
import { KPICard } from '../charts/KPICard';
import { BarChart } from '../charts/BarChart';
import { LineChart } from '../charts/LineChart';
import { DataTable } from '../charts/DataTable';
import { LanguageCard } from '../ui/LanguageCard';
import { StatCard } from '../ui/StatCard';

/* ── Types ── */
interface ExperimentFindingsProps {
  /** Page title, e.g. "Llama 3.1 8B — My Results" */
  title: string;
  /** Short description shown below the title */
  description: string;
  /** Badge label shown next to the icon, e.g. "My Experiment" */
  badge: string;
  /** Material Symbols icon name for the header */
  icon?: string;
  /** Path to the CSV file in public/data/ */
  csvPath: string;
  /** Column name(s) in the CSV that hold model scores (excluding 'code' and 'avg') */
  modelKeys: string[];
  /** Display-friendly model names (same order as modelKeys). Falls back to modelKeys. */
  modelLabels?: string[];
  /** Dataset name shown in subtitles, e.g. "FLORES-200" */
  datasetName?: string;
  /** Pooling method shown in subtitles, e.g. "Max pooling across layers" */
  poolingMethod?: string;
}

/* ── CSV parser ── */
function parseCSV(text: string) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  const data: Record<string, any>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const row: Record<string, any> = { code: cols[0] };
    for (let j = 1; j < headers.length; j++) {
      row[headers[j]] = parseFloat(cols[j]) || 0;
    }
    data.push(row);
  }
  return data;
}

/* ── Color helpers ── */
function scoreColor(score: number) {
  if (score >= 0.7) return '#004655';
  if (score >= 0.4) return '#13677b';
  if (score >= 0.2) return '#8bd1e8';
  return '#ba1a1a';
}

function scoreTier(score: number) {
  if (score >= 0.7) return { label: 'High', level: 'high' as const };
  if (score >= 0.4) return { label: 'Medium', level: 'medium' as const };
  return { label: 'Low', level: 'low' as const };
}

function heatmapColor(value: number) {
  if (value <= 0) return 'rgba(231,232,233,1)';
  if (value < 0.2) return 'rgba(185,201,207,1)';
  if (value < 0.4) return 'rgba(139,209,232,1)';
  if (value < 0.6) return 'rgba(19,103,123,1)';
  if (value < 0.8) return 'rgba(0,95,115,1)';
  return 'rgba(0,70,85,1)';
}

function heatmapTextColor(value: number) {
  return value > 0.35 ? 'text-white' : 'text-on-surface';
}

function getScript(code: string) {
  const parts = code.split('_');
  return parts.length > 1 ? parts[1] : 'Unknown';
}

/* ── Component ── */
export default function ExperimentFindings({
  title,
  description,
  badge,
  icon = 'experiment',
  csvPath,
  modelKeys,
  modelLabels,
  datasetName = 'FLORES-200',
  poolingMethod = 'Max pooling across layers',
}: ExperimentFindingsProps) {
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [languageNames, setLanguageNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [heatmapCount, setHeatmapCount] = useState(40);

  const labels = modelLabels || modelKeys;
  const isSingleModel = modelKeys.length === 1;

  /* ── Load data ── */
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [langNames, csvText] = await Promise.all([
          fetch('/data/language_names.json').then(r => r.json()),
          fetch(csvPath).then(r => r.text()),
        ]);

        const parsed = parseCSV(csvText);

        const nameMap: Record<string, string> = {};
        parsed.forEach(row => {
          const iso = row.code.split('_')[0];
          nameMap[row.code] = langNames[iso] || row.code;
        });

        setLanguageNames(nameMap);
        setData(parsed);
      } catch (err) {
        console.error('Failed to load experiment data:', err);
      }
      setLoading(false);
    }
    load();
  }, [csvPath]);

  /* ── Average score per row (across selected models) ── */
  const avgKey = isSingleModel ? modelKeys[0] : 'avg';

  const getAvg = (row: Record<string, any>) => {
    if (row.avg !== undefined) return row.avg;
    const vals = modelKeys.map(k => row[k] || 0);
    return vals.reduce((a: number, b: number) => a + b, 0) / vals.length;
  };

  /* ── Stats ── */
  const stats = useMemo(() => {
    if (!data.length) return null;

    const scores = data.map(r => getAvg(r));
    const totalLangs = data.length;
    const globalAvg = scores.reduce((a, b) => a + b, 0) / totalLangs;
    const median = [...scores].sort((a, b) => a - b)[Math.floor(totalLangs / 2)];

    const sorted = [...data].sort((a, b) => getAvg(b) - getAvg(a));
    const topLang = sorted[0];
    const bottomLang = sorted[sorted.length - 1];

    const perfect = data.filter(r => getAvg(r) >= 1.0).length;
    const high = data.filter(r => getAvg(r) >= 0.7 && getAvg(r) < 1.0).length;
    const medium = data.filter(r => getAvg(r) >= 0.4 && getAvg(r) < 0.7).length;
    const low = data.filter(r => getAvg(r) >= 0.2 && getAvg(r) < 0.4).length;
    const veryLow = data.filter(r => getAvg(r) < 0.2).length;

    // Per-model averages (for multi-model)
    const modelAvgs: Record<string, number> = {};
    modelKeys.forEach(k => {
      const vals = data.map(r => r[k] || 0);
      modelAvgs[k] = vals.reduce((a: number, b: number) => a + b, 0) / vals.length;
    });

    return { totalLangs, globalAvg, median, topLang, bottomLang, perfect, high, medium, low, veryLow, modelAvgs };
  }, [data, modelKeys]);

  /* ── Script-level aggregation ── */
  const scriptData = useMemo(() => {
    if (!data.length) return [];
    const groups: Record<string, { script: string; scores: number[]; count: number }> = {};
    data.forEach(row => {
      const script = getScript(row.code);
      if (!groups[script]) groups[script] = { script, scores: [], count: 0 };
      groups[script].scores.push(getAvg(row));
      groups[script].count++;
    });
    return Object.values(groups)
      .map(g => ({
        script: g.script,
        avg: parseFloat((g.scores.reduce((a, b) => a + b, 0) / g.count).toFixed(4)),
        count: g.count,
      }))
      .filter(g => g.count >= 2)
      .sort((a, b) => b.avg - a.avg);
  }, [data, modelKeys]);

  /* ── Model performance bar data (multi-model) ── */
  const modelBarData = useMemo(() => {
    if (!stats || isSingleModel) return [];
    return modelKeys.map((k, i) => ({
      model: labels[i],
      score: parseFloat(stats.modelAvgs[k].toFixed(4)),
    })).sort((a, b) => b.score - a.score);
  }, [stats, modelKeys, labels, isSingleModel]);

  /* ── Score distribution ── */
  const distributionData = useMemo(() => {
    if (!data.length) return [];
    const bins = Array.from({ length: 10 }, (_, i) => ({
      range: `${(i / 10).toFixed(1)}-${((i + 1) / 10).toFixed(1)}`,
      count: 0,
    }));
    data.forEach(row => {
      const idx = Math.min(Math.floor(getAvg(row) * 10), 9);
      bins[idx].count++;
    });
    return bins;
  }, [data, modelKeys]);

  /* ── Featured languages ── */
  const featuredLanguages = useMemo(() => {
    if (!data.length) return [];
    const sorted = [...data].sort((a, b) => getAvg(b) - getAvg(a));
    const top3 = sorted.slice(0, 3);
    const bottom3 = sorted.slice(-3).reverse();
    return [...top3, ...bottom3].map(row => ({
      code: row.code,
      name: languageNames[row.code] || row.code,
      family: getScript(row.code),
      script: getScript(row.code),
      resourceLevel: scoreTier(getAvg(row)).level,
      scores: modelKeys.map((k, i) => ({ model: labels[i], score: row[k] || 0 })),
      avgScore: getAvg(row),
    }));
  }, [data, languageNames, modelKeys, labels]);

  /* ── DataTable columns ── */
  const tableColumns = useMemo(() => {
    const cols: any[] = [
      {
        key: 'rank',
        label: '#',
        align: 'center',
        sortable: true,
        render: (val: number) => (
          <span className="text-xs font-mono font-bold text-on-surface-variant">{val}</span>
        ),
      },
      {
        key: 'name',
        label: 'Language',
        sortable: true,
        filterable: true,
        render: (val: string, row: any) => (
          <div>
            <span className="font-headline font-bold text-sm text-on-surface">{val}</span>
            <span className="block font-mono text-[10px] text-on-surface-variant">{row.code}</span>
          </div>
        ),
      },
      {
        key: 'script',
        label: 'Script',
        sortable: true,
        filterable: true,
        render: (val: string) => (
          <span className="text-xs font-mono bg-surface-container-high px-2 py-0.5 rounded">{val}</span>
        ),
      },
    ];

    // Model score columns
    modelKeys.forEach((k, i) => {
      cols.push({
        key: k,
        label: labels[i],
        align: 'center',
        sortable: true,
        render: (val: any) => {
          const v = typeof val === 'number' ? val : parseFloat(val) || 0;
          return (
            <div className="flex items-center justify-center gap-2">
              <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${v * 100}%`, backgroundColor: scoreColor(v) }}
                />
              </div>
              <span className="text-sm font-headline font-extrabold" style={{ color: scoreColor(v) }}>
                {v.toFixed(3)}
              </span>
            </div>
          );
        },
      });
    });

    // Tier column
    cols.push({
      key: 'tier',
      label: 'Tier',
      align: 'center',
      sortable: true,
      render: (val: string) => {
        const colors: Record<string, string> = {
          High: 'bg-primary/15 text-primary',
          Medium: 'bg-tertiary/15 text-tertiary',
          Low: 'bg-error/15 text-error',
        };
        return (
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${colors[val] || ''}`}>
            {val}
          </span>
        );
      },
    });

    return cols;
  }, [modelKeys, labels]);

  /* ── DataTable rows ── */
  const tableData = useMemo(() => {
    const sorted = [...data].sort((a, b) => getAvg(b) - getAvg(a));
    return sorted.map((row, idx) => ({
      rank: idx + 1,
      code: row.code,
      name: languageNames[row.code] || row.code,
      script: getScript(row.code),
      ...Object.fromEntries(modelKeys.map(k => [k, row[k] || 0])),
      tier: scoreTier(getAvg(row)).label,
    }));
  }, [data, languageNames, modelKeys]);

  /* ── Loading ── */
  if (loading) {
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
      {/* ── Header ── */}
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-3">
          <span className="material-symbols-outlined text-3xl text-primary">{icon}</span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-tertiary bg-tertiary/10 px-3 py-1 rounded-full">
            {badge}
          </span>
        </div>
        <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight mb-4">
          {title}
        </h2>
        <p className="text-on-surface-variant font-body leading-relaxed max-w-2xl italic">
          {description}
        </p>
      </div>

      {/* ── KPI Cards ── */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Languages Evaluated"
            value={stats.totalLangs}
            icon="translate"
            description={
              <span>
                <strong>{stats.perfect}</strong> perfect, <strong>{stats.high + stats.perfect}</strong> high alignment (&ge;0.7)
              </span>
            }
          />
          <KPICard
            title="Global Average"
            value={stats.globalAvg.toFixed(4)}
            icon="analytics"
            description={
              <span>
                Median score: <strong>{stats.median.toFixed(3)}</strong> across all languages
              </span>
            }
          />
          <KPICard
            title="Top Language"
            value={languageNames[stats.topLang.code] || stats.topLang.code}
            icon="star"
            description={
              <span>
                Score of <strong>{getAvg(stats.topLang).toFixed(3)}</strong> — strongest alignment
              </span>
            }
          />
          <KPICard
            title="Lowest Language"
            value={languageNames[stats.bottomLang.code] || stats.bottomLang.code}
            icon="warning"
            description={
              <span>
                Score of <strong>{getAvg(stats.bottomLang).toFixed(3)}</strong> — weakest alignment
              </span>
            }
          />
        </div>
      )}

      {/* ── Bento Grid ── */}
      <div className="grid grid-cols-12 gap-8">

        {/* ── Score Distribution ── */}
        <div className={`col-span-12 ${isSingleModel ? 'lg:col-span-7' : 'lg:col-span-5'} bg-surface-container-low p-8 rounded-xl`}>
          <div className="mb-8">
            <h3 className="text-lg font-headline font-bold text-primary mb-1 uppercase tracking-wider">
              Score Distribution
            </h3>
            <p className="text-xs text-on-surface-variant font-label">
              How MEXA scores are distributed across {stats?.totalLangs || 0} languages
            </p>
          </div>
          <LineChart
            data={distributionData}
            xAxisKey="range"
            series={[{ key: 'count', color: '#004655', name: 'Languages' }]}
            height={340}
            yAxisFormatter={(v: number) => String(Math.round(v))}
          />
          {stats && (
            <div className="grid grid-cols-5 gap-3 mt-6">
              <StatCard label="Perfect (1.0)" value={stats.perfect} accentColor="border-primary" valueColor="text-primary" />
              <StatCard label="High" value={stats.high} accentColor="border-primary/60" valueColor="text-primary" />
              <StatCard label="Medium" value={stats.medium} accentColor="border-tertiary" valueColor="text-tertiary" />
              <StatCard label="Low" value={stats.low} accentColor="border-outline" valueColor="text-on-surface-variant" />
              <StatCard label="Very Low" value={stats.veryLow} accentColor="border-error" valueColor="text-error" />
            </div>
          )}
        </div>

        {/* ── Model Performance (multi-model) or Script Performance (single-model) ── */}
        <div className={`col-span-12 ${isSingleModel ? 'lg:col-span-5' : 'lg:col-span-7'} bg-surface-container-low p-8 rounded-xl`}>
          <div className="mb-8">
            <h3 className="text-lg font-headline font-bold text-primary mb-1 uppercase tracking-wider">
              {isSingleModel ? 'Performance by Script' : 'Model Performance Ranking'}
            </h3>
            <p className="text-xs text-on-surface-variant font-label">
              {isSingleModel
                ? 'Average MEXA score grouped by writing system (scripts with 2+ languages)'
                : `Average MEXA score per model across all ${stats?.totalLangs || 0} languages`}
            </p>
          </div>
          <BarChart
            data={isSingleModel ? scriptData : modelBarData}
            categoryKey={isSingleModel ? 'script' : 'model'}
            series={[{ key: isSingleModel ? 'avg' : 'score', color: '#004655', name: isSingleModel ? 'Avg MEXA' : 'MEXA Score' }]}
            layout="vertical"
            height={380}
            valueFormatter={(v: number) => v.toFixed(3)}
          />
        </div>

        {/* ── Grid Heatmap ── */}
        <div className="col-span-12 bg-surface-container-low p-8 rounded-xl overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-headline font-bold text-primary mb-1 uppercase tracking-wider">
                Language Alignment Scores
              </h3>
              <p className="text-xs text-on-surface-variant font-label">
                MEXA scores ranked by alignment — top {Math.min(heatmapCount, data.length)} of {data.length} languages
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-1.5">
            {[...data]
              .sort((a, b) => getAvg(b) - getAvg(a))
              .slice(0, heatmapCount)
              .map((row, idx) => {
                const v = getAvg(row);
                return (
                  <div
                    key={row.code}
                    className={`group relative rounded-lg p-2.5 flex flex-col items-center justify-center transition-all hover:scale-105 hover:z-10 hover:shadow-lg cursor-default ${heatmapTextColor(v)}`}
                    style={{ backgroundColor: heatmapColor(v) }}
                    title={`${languageNames[row.code] || row.code}: ${v.toFixed(4)}`}
                  >
                    <span className="text-[10px] font-bold opacity-60">#{idx + 1}</span>
                    <span className="text-xs font-headline font-bold truncate max-w-full">
                      {languageNames[row.code] || row.code}
                    </span>
                    <span className="text-sm font-mono font-extrabold">{v.toFixed(2)}</span>
                    <span className="text-[8px] font-mono opacity-60">{row.code}</span>
                  </div>
                );
              })}
          </div>

          {data.length > heatmapCount && (
            <button
              onClick={() => setHeatmapCount(prev => prev + 40)}
              className="mt-4 mx-auto block text-[10px] font-bold uppercase tracking-widest py-2 px-6 rounded bg-surface-container-lowest text-on-surface-variant hover:bg-white hover:text-primary transition-colors"
            >
              Show more ({data.length - heatmapCount} remaining)
            </button>
          )}
        </div>

        {/* ── Featured Languages ── */}
        <div className="col-span-12">
          <h3 className="text-lg font-headline font-bold text-primary mb-2 uppercase tracking-wider">
            Featured Languages
          </h3>
          <p className="text-xs text-on-surface-variant font-label mb-6">
            Top 3 and bottom 3 performing languages by MEXA score
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
            title={`Complete MEXA Scores — ${title}`}
            subtitle={`${datasetName} / ${poolingMethod}`}
            columns={tableColumns}
            data={tableData}
            rowsPerPage={15}
            enableSearch
            searchPlaceholder="Search by language name, code, or script..."
            enableSorting
            enableExport
            exportFilename={`mexa-${title.toLowerCase().replace(/\s+/g, '-')}`}
            enableDensityToggle
          />
        </div>
      </div>
    </div>
  );
}
