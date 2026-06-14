import { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CorrelationMatrix } from '../charts/CorrelationMatrix';
import { BarChart } from '../charts/BarChart';
import { Select } from '../form/Select';
import {
  MEXA_SCORES,
  QWEN3_SCORES,
  ENCODER_SCORES,
  EMBEDDING_SCORES,
  VARIANT_COLUMNS,
  type ModelRow,
  type Variant
} from './Overview';

// Combine all scores for model correlation calculation
const ALL_MODEL_ROWS: ModelRow[] = [
  ...MEXA_SCORES,
  ...QWEN3_SCORES.filter(r => !MEXA_SCORES.some(m => m.model === r.model)),
  ...ENCODER_SCORES,
  ...EMBEDDING_SCORES
];

// Helper to check model type
function getModelType(modelName: string): 'decoder' | 'encoder' | 'unknown' {
  const decoders = ['apertus', 'llama', 'mistral', 'qwen3.5', 'qwen3_0.6', 'qwen3_1.7', 'qwen3_4', 'qwen3_8', 'qwen3-4b', 'qwen3-1.7b', 'qwen3-0.6b'];
  const encoders = ['glot500', 'labse', 'me5', 'mmbert', 'xlmr', 'qwen3_emb'];
  const nameLower = modelName.toLowerCase();

  if (decoders.some(d => nameLower.includes(d))) return 'decoder';
  if (encoders.some(e => nameLower.includes(e))) return 'encoder';
  return 'unknown';
}

// Map model display names to CSV suffixes
const MODEL_CSV_MAP: Record<string, string> = {
  'Llama 3.1 8B': 'llama3.1_8b',
  'Mistral 7B v0.3': 'mistral_7b_v03',
  'Qwen3 8B Base': 'qwen3_8b',
  'Qwen3.5 9B Base': 'qwen3.5_9b',
  'Apertus 8B': 'apertus8b',
  'Qwen3 4B': 'qwen3_4b',
  'Qwen3 1.7B': 'qwen3_1.7b',
  'Qwen3 0.6B': 'qwen3_0.6b',
  'LaBSE': 'labse',
  'Multilingual E5 base': 'me5_base',
  'Glot500 base': 'glot500',
  'XLM-RoBERTa large': 'xlmr_large',
  'XLM-RoBERTa base': 'xlmr_base',
  'mmBERT base': 'mmbert_base',
  'Qwen3-Embedding-8B': 'qwen3_emb_8b',
  'Qwen3-Embedding-4B': 'qwen3_emb_4b',
  'Qwen3-Embedding-0.6B': 'qwen3_emb_0.6b',
};

// Available comparisons for the interactive Rank Scatter Plot
const COMPARISON_OPTIONS = [
  { value: 'max_vs_mean_flores', label: 'Max vs. Mean (FLORES Table 1, 2k sents)' },
  { value: 'max_vs_mean_bible', label: 'Max vs. Mean (Bible Table 1)' },
  { value: 'flores_100_vs_2000_max', label: 'FLORES 100 vs. 2000 sents (Max)' },
  { value: 'flores_100_vs_2000_mean', label: 'FLORES 100 vs. 2000 sents (Mean)' },
  { value: 'flores_vs_bible_max', label: 'FLORES vs. Bible Table 1 (Max)' },
  { value: 'flores_vs_bible_mean', label: 'FLORES vs. Bible Table 1 (Mean)' },
];

/* ── CSV Parser ── */
function parseResultsCSV(text: string) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(',');
  const rows = lines.slice(1).map(line => {
    const cols = line.split(',');
    const obj: Record<string, string | number> = {};
    headers.forEach((h, idx) => {
      const val = cols[idx];
      obj[h] = isNaN(Number(val)) ? val : parseFloat(val);
    });
    return obj;
  });
  return { headers, rows };
}

/* ── Mathematical Rank Correlation Helpers ── */
function rankArray(arr: number[]): number[] {
  const sorted = arr.map((val, idx) => ({ val, idx })).sort((a, b) => a.val - b.val);
  const ranks = new Array(arr.length);
  let i = 0;
  while (i < sorted.length) {
    let j = i + 1;
    while (j < sorted.length && sorted[j].val === sorted[i].val) {
      j++;
    }
    const avgRank = 1 + (i + j - 1) / 2;
    for (let k = i; k < j; k++) {
      ranks[sorted[k].idx] = avgRank;
    }
    i = j;
  }
  return ranks;
}

function spearmanCorrelation(x: number[], y: number[]): number {
  const rx = rankArray(x);
  const ry = rankArray(y);
  const n = x.length;
  if (n === 0) return 0;

  const meanX = rx.reduce((a, b) => a + b, 0) / n;
  const meanY = ry.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = rx[i] - meanX;
    const dy = ry[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  if (denX === 0 || denY === 0) return 0;
  return num / Math.sqrt(denX * denY);
}

function kendallCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return 0;
  let concordant = 0;
  let discordant = 0;
  let tiesX = 0;
  let tiesY = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = x[i] - x[j];
      const dy = y[i] - y[j];
      if (dx === 0 && dy === 0) {
        continue;
      } else if (dx === 0) {
        tiesX++;
      } else if (dy === 0) {
        tiesY++;
      } else if ((dx > 0 && dy > 0) || (dx < 0 && dy < 0)) {
        concordant++;
      } else {
        discordant++;
      }
    }
  }
  const totalPairs = (n * (n - 1)) / 2;
  const den = Math.sqrt((totalPairs - tiesX) * (totalPairs - tiesY));
  if (den === 0) return 0;
  return (concordant - discordant) / den;
}

export default function RankingValidation() {
  const [selectedModel, setSelectedModel] = useState('Llama 3.1 8B');
  const [comparisonKey, setComparisonKey] = useState('max_vs_mean_flores');
  const [scatterData, setScatterData] = useState<any[]>([]);
  const [correlations, setCorrelations] = useState<{ rho: number; tau: number } | null>(null);
  const [loadingScatter, setLoadingScatter] = useState(false);
  const [errorScatter, setErrorScatter] = useState<string | null>(null);
  const [languageNames, setLanguageNames] = useState<Record<string, string>>({});
  const [modelCorrMetric, setModelCorrMetric] = useState<'max' | 'mean'>('max');

  // Load language names on mount
  useEffect(() => {
    fetch('/data/language_names.json')
      .then(r => r.json())
      .then(data => {
        const nameMap: Record<string, string> = {};
        Object.entries(data).forEach(([iso, name]) => {
          nameMap[iso] = name as string;
        });
        setLanguageNames(nameMap);
      })
      .catch(err => console.error('Failed to load language names:', err));
  }, []);

  // Fetch scatter data dynamically based on selection
  useEffect(() => {
    async function fetchAndCalculate() {
      setLoadingScatter(true);
      setErrorScatter(null);
      const suffix = MODEL_CSV_MAP[selectedModel];
      if (!suffix) {
        setErrorScatter('Model data mapping not found.');
        setLoadingScatter(false);
        return;
      }

      try {
        let fileA = '';
        let fileB = '';
        let colA = '';
        let colB = '';
        let limitToOverlap = false;

        const getFlores2000Path = (s: string) => {
          if (s === 'llama3.1_8b' || s === 'mistral_7b_v03') {
            return `/data/flores_table1_${s}_results.csv`;
          }
          return `/data/flores_table1_2000_${s}_results.csv`;
        };

        switch (comparisonKey) {
          case 'max_vs_mean_flores':
            fileA = getFlores2000Path(suffix);
            colA = 'max';
            colB = 'mean';
            break;
          case 'max_vs_mean_bible':
            fileA = `/data/bible_table1_${suffix}_results.csv`;
            colA = 'max';
            colB = 'mean';
            break;
          case 'flores_100_vs_2000_max':
            fileA = `/data/flores_table1_100_${suffix}_results.csv`;
            fileB = getFlores2000Path(suffix);
            colA = 'max';
            colB = 'max';
            break;
          case 'flores_100_vs_2000_mean':
            fileA = `/data/flores_table1_100_${suffix}_results.csv`;
            fileB = getFlores2000Path(suffix);
            colA = 'mean';
            colB = 'mean';
            break;
          case 'flores_vs_bible_max':
            fileA = `/data/flores_table1_100_${suffix}_results.csv`;
            fileB = `/data/bible_table1_${suffix}_results.csv`;
            colA = 'max';
            colB = 'max';
            limitToOverlap = true;
            break;
          case 'flores_vs_bible_mean':
            fileA = `/data/flores_table1_100_${suffix}_results.csv`;
            fileB = `/data/bible_table1_${suffix}_results.csv`;
            colA = 'mean';
            colB = 'mean';
            limitToOverlap = true;
            break;
        }

        // Fetch files
        const responseA = await fetch(fileA);
        if (!responseA.ok) {
          throw new Error(`Failed to load ${selectedModel} data for Variable A (status ${responseA.status})`);
        }
        const resA = await responseA.text();
        const csvA = parseResultsCSV(resA);
        if (!csvA.headers.includes('code')) {
          throw new Error(`Format error: code column not found in ${fileA}`);
        }

        let mergedRows: any[] = [];

        if (fileB) {
          const responseB = await fetch(fileB);
          if (!responseB.ok) {
            throw new Error(`Failed to load ${selectedModel} data for Variable B (status ${responseB.status})`);
          }
          const resB = await responseB.text();
          const csvB = parseResultsCSV(resB);
          if (!csvB.headers.includes('code')) {
            throw new Error(`Format error: code column not found in ${fileB}`);
          }

          // Find column headers ending with _max or _mean
          const hA_max = csvA.headers.find(h => h.endsWith('_max')) || '';
          const hA_mean = csvA.headers.find(h => h.endsWith('_mean')) || '';
          const hB_max = csvB.headers.find(h => h.endsWith('_max')) || '';
          const hB_mean = csvB.headers.find(h => h.endsWith('_mean')) || '';

          const actualColA = colA === 'max' ? hA_max : hA_mean;
          const actualColB = colB === 'max' ? hB_max : hB_mean;

          // Merge on language code
          csvA.rows.forEach(rA => {
            const code = rA['code'] as string;
            if (code === 'eng_Latn') return; // Skip pivot

            const rB = csvB.rows.find(row => row['code'] === code);
            if (rB) {
              mergedRows.push({
                code,
                valA: rA[actualColA] as number,
                valB: rB[actualColB] as number
              });
            }
          });
        } else {
          // Max vs Mean (same file)
          const h_max = csvA.headers.find(h => h.endsWith('_max')) || '';
          const h_mean = csvA.headers.find(h => h.endsWith('_mean')) || '';
          const actualColA = colA === 'max' ? h_max : h_mean;
          const actualColB = colB === 'max' ? h_max : h_mean;

          csvA.rows.forEach(r => {
            const code = r['code'] as string;
            if (code === 'eng_Latn') return;
            mergedRows.push({
              code,
              valA: r[actualColA] as number,
              valB: r[actualColB] as number
            });
          });
        }

        if (mergedRows.length === 0) {
          setErrorScatter('No overlapping data found.');
          setLoadingScatter(false);
          return;
        }

        // Rank the values
        const valsA = mergedRows.map(r => r.valA);
        const valsB = mergedRows.map(r => r.valB);
        const ranksA = rankArray(valsA);
        const ranksB = rankArray(valsB);

        // Convert ranks to 1-indexed descending ranks (higher score = rank 1)
        const total = mergedRows.length;
        const finalData = mergedRows.map((row, idx) => {
          // Re-scale rank so that the HIGHEST value gets rank 1, and LOWEST gets rank N
          // rankArray returns ranks where lowest value gets rank 1.
          // Inverted rank = (Total - rankArray_val + 1)
          const rankA = total - ranksA[idx] + 1;
          const rankB = total - ranksB[idx] + 1;

          const iso = (row.code || '').split('_')[0];
          const name = languageNames[iso] || row.code;

          return {
            code: row.code,
            name,
            valA: row.valA,
            valB: row.valB,
            rankX: rankA, // Plotted on X
            rankY: rankB  // Plotted on Y
          };
        });

        // Compute correlations
        const rho = spearmanCorrelation(valsA, valsB);
        const tau = kendallCorrelation(valsA, valsB);

        setCorrelations({ rho, tau });
        setScatterData(finalData);
      } catch (err) {
        console.error(err);
        setErrorScatter('Failed to load results CSV files.');
      }
      setLoadingScatter(false);
    }

    fetchAndCalculate();
  }, [selectedModel, comparisonKey, languageNames]);

  // Compute symmetric Model Correlation Matrix on the fly
  const modelCorrData = useMemo(() => {
    const labels = VARIANT_COLUMNS.map(v => v.label.replace('FLORES', 'FLORES').replace('Bible', 'Bible'));
    const keys = VARIANT_COLUMNS.map(v => v.key);

    const matrix: number[][] = Array.from({ length: 5 }, () => Array(5).fill(1));

    for (let i = 0; i < keys.length; i++) {
      for (let j = i + 1; j < keys.length; j++) {
        const keyA = keys[i];
        const keyB = keys[j];

        // Find models that have score in both keys
        const overlapModels = ALL_MODEL_ROWS.filter(row => {
          const sA = row.scores[keyA];
          const sB = row.scores[keyB];
          return sA && sA[modelCorrMetric] !== null && sB && sB[modelCorrMetric] !== null;
        });

        if (overlapModels.length >= 3) {
          const scoresA = overlapModels.map(row => row.scores[keyA][modelCorrMetric] as number);
          const scoresB = overlapModels.map(row => row.scores[keyB][modelCorrMetric] as number);
          const rho = spearmanCorrelation(scoresA, scoresB);

          matrix[i][j] = parseFloat(rho.toFixed(4));
          matrix[j][i] = parseFloat(rho.toFixed(4));
        } else {
          matrix[i][j] = 0;
          matrix[j][i] = 0;
        }
      }
    }

    return { labels, matrix };
  }, [modelCorrMetric]);

  // Cross-Domain Language Rank Correlation Bar Chart (hardcoded from run_analysis.py output)
  const crossDomainBarData = [
    { model: 'Qwen3 1.7B', type: 'decoder', value: 0.9486 },
    { model: 'Qwen3-Emb 4B', type: 'encoder', value: 0.9480 },
    { model: 'Qwen3 8B Base', type: 'decoder', value: 0.9419 },
    { model: 'Llama 3.1 8B', type: 'decoder', value: 0.9258 },
    { model: 'Qwen3-Emb 8B', type: 'encoder', value: 0.9177 },
    { model: 'Mistral 7B', type: 'decoder', value: 0.9152 },
    { model: 'Qwen3-Emb 0.6B', type: 'encoder', value: 0.9015 },
    { model: 'Qwen3.5 9B', type: 'decoder', value: 0.8922 },
    { model: 'XLM-R Large', type: 'encoder', value: 0.8842 },
    { model: 'Qwen3 0.6B', type: 'decoder', value: 0.8796 },
    { model: 'mmBERT Base', type: 'encoder', value: 0.8761 },
    { model: 'Apertus 8B', type: 'decoder', value: 0.8197 },
    { model: 'Glot500 Base', type: 'encoder', value: 0.6648 },
    { model: 'ME5 Base', type: 'encoder', value: 0.5151 },
    { model: 'LaBSE', type: 'encoder', value: 0.3918 },
  ];

  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0]?.payload;
    if (!p) return null;
    return (
      <div className="bg-primary text-on-primary py-3 px-4 rounded-lg shadow-xl text-xs max-w-64">
        <p className="font-headline font-bold text-sm leading-tight mb-1">{p.name}</p>
        <p className="font-mono text-[9px] uppercase tracking-widest opacity-70 mb-2">{p.code}</p>
        <p>Rank X: <strong className="font-mono text-white text-sm">{p.rankX}</strong> ({p.valA.toFixed(4)})</p>
        <p>Rank Y: <strong className="font-mono text-white text-sm">{p.rankY}</strong> ({p.valB.toFixed(4)})</p>
        <p className="mt-1 pt-1 border-t border-outline-variant/30 text-[10px] opacity-80 italic">
          Rank difference: {Math.abs(p.rankX - p.rankY)}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-3">
          <span className="material-symbols-outlined text-3xl text-primary">rule</span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            Statistical Validation
          </span>
        </div>
        <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight mb-4">
          MEXA Ranking Consistency
        </h2>
        <p className="text-on-surface-variant font-body leading-relaxed max-w-2xl">
          A statistical exploration checking whether different layers, pooling configurations (Max vs. Mean),
          sentence counts, and corpus domains (FLORES vs. Bible) produce the same relative rankings of models and target languages.
        </p>
      </div>

      {/* Grid: Matrix & Scatter Plot */}
      <div className="grid grid-cols-12 gap-8">

        {/* Interactive Rank Scatter Plot */}
        <div className="col-span-12 xl:col-span-7 bg-surface-container-low p-8 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider">
                  Language Rank Scatter Plot
                </h3>
                <p className="text-xs text-on-surface-variant font-label mt-1">
                  Plots the ordinal ranks of languages to visualize correlation. Diagonal points show perfect consistency.
                </p>
              </div>
              <div className="flex gap-3 shrink-0 w-full md:w-auto">
                <div className="w-40">
                  <Select
                    label="Model"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    options={Object.keys(MODEL_CSV_MAP).map(m => ({ value: m, label: m }))}
                  />
                </div>
                <div className="w-56">
                  <Select
                    label="Comparison Variable"
                    value={comparisonKey}
                    onChange={(e) => setComparisonKey(e.target.value)}
                    options={COMPARISON_OPTIONS}
                  />
                </div>
              </div>
            </div>

            {/* Correlation stats summary cards */}
            {correlations && (
              <div className="grid grid-cols-2 gap-4 mb-6 bg-surface-container-lowest/70 p-4 rounded-xl">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold block mb-1">
                    Spearman's Rank Correlation (ρ)
                  </span>
                  <span className="text-2xl font-headline font-extrabold text-primary">
                    {correlations.rho.toFixed(4)}
                  </span>
                  <p className="text-[10px] text-on-surface-variant/80 mt-1 leading-normal">
                    {correlations.rho > 0.90
                      ? '★ Extremely consistent rankings (monotonic)'
                      : correlations.rho > 0.80
                        ? '✓ Strong ranking agreement'
                        : '⚠ Moderate ranking shifts present'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold block mb-1">
                    Kendall's Tau (τ)
                  </span>
                  <span className="text-2xl font-headline font-extrabold text-primary">
                    {correlations.tau.toFixed(4)}
                  </span>
                  <p className="text-[10px] text-on-surface-variant/80 mt-1 leading-normal">
                    Probability of rank concordance: {((correlations.tau + 1) / 2 * 100).toFixed(1)}% of language pairs are ordered identically.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Scatter Chart canvas */}
          {loadingScatter ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3 text-on-surface-variant/40">
              <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
              <span className="text-[10px] uppercase font-bold tracking-widest">Calculating ranks...</span>
            </div>
          ) : errorScatter ? (
            <div className="h-96 flex items-center justify-center text-sm font-bold text-error">
              {errorScatter}
            </div>
          ) : (
            <div className="h-96 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid stroke="rgba(113, 121, 113, 0.1)" />
                  <XAxis
                    type="number"
                    dataKey="rankX"
                    name="Variable A Rank"
                    domain={[1, 'dataMax']}
                    reversed
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#717971', fontSize: 10, fontWeight: 500 }}
                    label={{ value: 'Rank in Variable A (Lower is better)', position: 'insideBottom', offset: -10, fill: '#717971', fontSize: 10, fontWeight: 600 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="rankY"
                    name="Variable B Rank"
                    domain={[1, 'dataMax']}
                    reversed
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#717971', fontSize: 10, fontWeight: 500 }}
                    label={{ value: 'Rank in Variable B (Lower is better)', angle: -90, position: 'insideLeft', offset: 12, fill: '#717971', fontSize: 10, fontWeight: 600 }}
                  />
                  <Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(0,70,85,0.15)' }} />
                  <Scatter
                    name="Language Rank"
                    data={scatterData}
                    fill="#13677b"
                    shape="circle"
                  />
                </ScatterChart>
              </ResponsiveContainer>
              {/* Ideal y=x diagonal reference line overlay */}
              <div className="absolute inset-0 pointer-events-none border-t border-l border-transparent flex items-center justify-center opacity-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <line x1="0" y1="100" x2="100" y2="0" stroke="#ba1a1a" strokeWidth="1" strokeDasharray="3 3" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Model Rank Correlation Heatmap */}
        <div className="col-span-12 xl:col-span-5 flex flex-col justify-between">
          <CorrelationMatrix
            title="Model Ranking Correlation Matrix"
            subtitle="Spearman rho of overall model rankings between different dataset variants. Shows how stable the model rankings are across setups."
            labels={modelCorrData.labels}
            matrix={modelCorrData.matrix}
            className="h-full flex-1 flex flex-col justify-between"
          />
          {/* Toggle for metric */}
          <div className="mt-4 bg-surface-container-low p-4 rounded-xl flex justify-between items-center border border-outline-variant/10">
            <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
              Pooling Strategy
            </span>
            <div className="flex gap-2 bg-surface-container-lowest p-1 rounded-lg">
              <button
                onClick={() => setModelCorrMetric('max')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${modelCorrMetric === 'max'
                  ? 'bg-primary text-white'
                  : 'text-on-surface-variant hover:text-primary'
                  }`}
              >
                µ_Max
              </button>
              <button
                onClick={() => setModelCorrMetric('mean')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${modelCorrMetric === 'mean'
                  ? 'bg-primary text-white'
                  : 'text-on-surface-variant hover:text-primary'
                  }`}
              >
                µ_Mean
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Bar Chart & Methodology Reference Card */}
      <div className="grid grid-cols-12 gap-8">

        {/* Cross-Domain stability of rankings */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container-low p-8 rounded-xl">
          <div className="mb-6">
            <h3 className="text-lg font-headline font-bold text-primary mb-1 uppercase tracking-wider">
              Cross-Domain Language Ranking Stability
            </h3>
            <p className="text-xs text-on-surface-variant font-label">
              Spearman Rank Correlation (ρ) of language alignments between FLORES-200 and the Bible Corpus (89 overlapping languages).
            </p>
          </div>

          <div className="mb-6 p-4 rounded-xl bg-surface-container-lowest/60 border border-outline-variant/10">
            <p className="text-xs font-body text-on-surface leading-relaxed">
              <strong>Crucial Finding</strong>: There is a massive structural gap between decoder-only LLMs and sentence encoders.
              Decoder-only models like <code>qwen3_8b</code> (ρ = 0.95) and <code>llama3.1_8b</code> (ρ = 0.93) maintain almost perfect rankings across corpora.
              Multilingual sentence encoders like <code>LaBSE</code> (ρ = 0.39) and <code>ME5</code> (ρ = 0.51) collapse under domain shifts due to vocabulary sensitivity.
            </p>
          </div>

          <BarChart
            data={crossDomainBarData}
            categoryKey="model"
            series={[{ key: 'value', color: '#004655', name: "Spearman's Rho" }]}
            layout="vertical"
            height={420}
            valueFormatter={(v) => v.toFixed(3)}
          />
        </div>

        {/* Scholarly Reference Card */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-low p-8 rounded-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-headline font-bold text-primary mb-6 uppercase tracking-wider">
              Statistical Reference Library
            </h3>

            <div className="space-y-6">
              {/* Spearman */}
              <div className="border-b border-outline-variant/10 pb-4">
                <h4 className="text-xs uppercase tracking-widest font-bold text-primary mb-2">
                  1. Spearman's Rank Correlation (ρ)
                </h4>
                <p className="text-xs text-on-surface leading-relaxed mb-2">
                  A non-parametric measure assessing how well the relationship between two rankings can be described using a monotonic function.
                </p>
                <div className="bg-surface-container-lowest p-2 rounded text-center font-mono text-[11px] text-primary font-bold">
                  ρ = 1 - (6 * Σ d² / (N * (N² - 1)))
                </div>
                <p className="text-[10px] text-on-surface-variant/70 mt-1 italic">
                  d is the rank difference for each language and N is the total number of languages. Ideal for language rankings (N ≈ 100).
                </p>
              </div>

              {/* Kendall */}
              <div className="border-b border-outline-variant/10 pb-4">
                <h4 className="text-xs uppercase tracking-widest font-bold text-primary mb-2">
                  2. Kendall's Rank Correlation (τ)
                </h4>
                <p className="text-xs text-on-surface leading-relaxed mb-2">
                  Measures the probability of rank concordance vs discordance across all possible pairs.
                </p>
                <div className="bg-surface-container-lowest p-2 rounded text-center font-mono text-[11px] text-primary font-bold">
                  τ = (C - D) / (0.5 * N * (N - 1))
                </div>
                <p className="text-[10px] text-on-surface-variant/70 mt-1 italic">
                  C is the number of concordant pairs and D is the number of discordant pairs. Ideal for model rankings (N ≈ 16).
                </p>
              </div>

              {/* Wilcoxon */}
              <div>
                <h4 className="text-xs uppercase tracking-widest font-bold text-primary mb-2">
                  3. Wilcoxon Signed-Rank Test
                </h4>
                <p className="text-xs text-on-surface leading-relaxed">
                  A non-parametric paired difference test. While rank correlations check if the relative order is identical, the Wilcoxon test confirms whether the absolute values of the two groups (e.g. Max vs Mean scores) differ significantly in magnitude (p &lt; 0.05).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-primary-container text-on-primary-container">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-lg shrink-0">info</span>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold mb-1">For Thesis Writing </p>
                <p className="text-xs leading-normal opacity-90">
                  Use Spearman's Rho to justify that 100-sentence subsets represent language properties accurately.
                  Use Kendall's Tau to report model-level comparison robustness.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
