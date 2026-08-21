import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DataTable } from '../charts/DataTable';

interface ModelOption {
  key: string;
  label: string;
  csvSuffix: string;
  maxCol: string;
  meanCol: string;
}

const MODELS: ModelOption[] = [
  { 
    key: 'llama3.1_8b', 
    label: 'Llama 3.1 8B', 
    csvSuffix: 'llama3.1_8b',
    maxCol: 'meta-llama/Llama-3.1-8B_max',
    meanCol: 'meta-llama/Llama-3.1-8B_mean'
  },
  { 
    key: 'mistral_7b', 
    label: 'Mistral 7B v0.3', 
    csvSuffix: 'mistral_7b_v03',
    maxCol: 'mistralai/Mistral-7B-v0.3_max',
    meanCol: 'mistralai/Mistral-7B-v0.3_mean'
  },
  { 
    key: 'qwen3.5_9b', 
    label: 'Qwen 3.5 9B Base', 
    csvSuffix: 'qwen3.5_9b',
    maxCol: 'Qwen/Qwen3.5-9B-Base_max',
    meanCol: 'Qwen/Qwen3.5-9B-Base_mean'
  },
  { 
    key: 'qwen3_8b', 
    label: 'Qwen 3 8B Base', 
    csvSuffix: 'qwen3_8b',
    maxCol: 'Qwen/Qwen3-8B-Base_max',
    meanCol: 'Qwen/Qwen3-8B-Base_mean'
  },
  { 
    key: 'qwen3_4b', 
    label: 'Qwen 3 4B', 
    csvSuffix: 'qwen3_4b',
    maxCol: 'Qwen/Qwen3-4B_max',
    meanCol: 'Qwen/Qwen3-4B_mean'
  }
];

const PIVOT_LANGUAGES = [
  { key: 'english', label: 'English (eng_Latn)', code: 'eng_Latn', color: '#3b82f6' },
  { key: 'arabic', label: 'Arabic (arb_Arab)', code: 'arb_Arab', color: '#f59e0b' },
  { key: 'german', label: 'German (deu_Latn)', code: 'deu_Latn', color: '#10b981' },
  { key: 'french', label: 'French (fra_Latn)', code: 'fra_Latn', color: '#8b5cf6' },
  { key: 'basque', label: 'Basque (eus_Latn)', code: 'eus_Latn', color: '#f43f5e' },
  { key: 'chinese', label: 'Chinese (zho_Hans)', code: 'zho_Hans', color: '#0891b2' }
];

interface LangRow {
  code: string;
  maxScore: number;
  meanScore: number;
}

type NormMode = 'raw' | 'zscore' | 'percentile';

const NORM_MODES: { key: NormMode; label: string }[] = [
  { key: 'raw', label: 'Raw' },
  { key: 'zscore', label: 'Z-Score' },
  { key: 'percentile', label: 'Percentile' },
];

interface PivotStat {
  mean: number;
  std: number;
  sorted: number[];
}

// Per-model mean scores across all languages (µ over the 110-language set),
// precomputed from the CSVs in public/data for both scoring variants.
const SUMMARY_ROWS: Record<'standard' | 'centered', Array<Record<string, any>>> = {
  standard: [
    { model: 'Llama 3.1 8B', engMax: 0.6735, engMean: 0.4196, arMax: 0.7335, arMean: 0.4638, deMax: 0.7315, deMean: 0.4852, frMax: 0.7266, frMean: 0.4822, basMax: 0.6995, basMean: 0.3500, zhoMax: 0.6856, zhoMean: 0.4397 },
    { model: 'Mistral 7B v0.3', engMax: 0.4980, engMean: 0.2878, arMax: 0.5068, arMean: 0.2911, deMax: 0.5322, deMean: 0.3689, frMax: 0.5275, frMean: 0.3614, basMax: 0.2158, basMean: 0.1007, zhoMax: 0.5000, zhoMean: 0.3228 },
    { model: 'Qwen3.5 9B Base', engMax: 0.7809, engMean: 0.5556, arMax: 0.7986, arMean: 0.5625, deMax: 0.7949, deMean: 0.5673, frMax: 0.8034, frMean: 0.5701, basMax: 0.7995, basMean: 0.4858, zhoMax: 0.7286, zhoMean: 0.4941 },
    { model: 'Qwen3 8B Base', engMax: 0.5759, engMean: 0.3211, arMax: 0.6537, arMean: 0.3815, deMax: 0.6697, deMean: 0.3965, frMax: 0.6566, frMean: 0.3905, basMax: 0.5903, basMean: 0.2517, zhoMax: 0.5275, zhoMean: 0.2712 },
    { model: 'Qwen3 4B', engMax: 0.4433, engMean: 0.2327, arMax: 0.5481, arMean: 0.3206, deMax: 0.5535, deMean: 0.3339, frMax: 0.5476, frMean: 0.3330, basMax: 0.3942, basMean: 0.1780, zhoMax: 0.3448, zhoMean: 0.1750 },
  ],
  centered: [
    { model: 'Llama 3.1 8B', engMax: 0.8902, engMean: 0.7365, arMax: 0.9033, arMean: 0.7435, deMax: 0.8990, deMean: 0.7556, frMax: 0.8984, frMean: 0.7578, basMax: 0.8797, basMean: 0.6945, zhoMax: 0.8788, zhoMean: 0.7202 },
    { model: 'Mistral 7B v0.3', engMax: 0.7264, engMean: 0.5578, arMax: 0.7250, arMean: 0.5545, deMax: 0.7418, deMean: 0.5962, frMax: 0.7404, frMean: 0.5941, basMax: 0.5085, basMean: 0.3683, zhoMax: 0.7100, zhoMean: 0.5451 },
    { model: 'Qwen3.5 9B Base', engMax: 0.9564, engMean: 0.8442, arMax: 0.9485, arMean: 0.8228, deMax: 0.9547, deMean: 0.8415, frMax: 0.9462, frMean: 0.8351, basMax: 0.9444, basMean: 0.7957, zhoMax: 0.9443, zhoMean: 0.8118 },
    { model: 'Qwen3 8B Base', engMax: 0.8429, engMean: 0.6584, arMax: 0.8467, arMean: 0.6646, deMax: 0.8566, deMean: 0.6908, frMax: 0.8483, frMean: 0.6883, basMax: 0.8066, basMean: 0.5872, zhoMax: 0.8077, zhoMean: 0.5852 },
    { model: 'Qwen3 4B', engMax: 0.7469, engMean: 0.5443, arMax: 0.7798, arMean: 0.5753, deMax: 0.7800, deMean: 0.5994, frMax: 0.7696, frMean: 0.6059, basMax: 0.6552, basMean: 0.4534, zhoMax: 0.6641, zhoMean: 0.4376 },
  ],
};

// Map a (possibly normalized) value to a 0..1 fraction for progress bars.
// Raw and percentile are already in [0,1]; z-scores are clamped to [-3, 3].
function barFraction(mode: NormMode, val: number): number {
  if (mode === 'zscore') return Math.max(0, Math.min(1, (val + 3) / 6));
  return Math.max(0, Math.min(1, val));
}

// Format a (possibly normalized) value for display.
function fmtVal(mode: NormMode, val: number): string {
  if (mode === 'zscore') return (val >= 0 ? '+' : '') + val.toFixed(2);
  if (mode === 'percentile') return (val * 100).toFixed(0) + '%';
  return val.toFixed(4);
}

function parseCSV(text: string, maxColName: string, meanColName: string): Record<string, LangRow> {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return {};

  const headers = lines[0].split(',');
  const maxIdx = headers.indexOf(maxColName);
  const meanIdx = headers.indexOf(meanColName);
  // Not a scores CSV (e.g. a 404/HTML response for a not-yet-computed pivot)
  if (maxIdx === -1 && meanIdx === -1) return {};

  const result: Record<string, LangRow> = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (!cols[0]) continue;
    result[cols[0]] = {
      code: cols[0],
      maxScore: maxIdx !== -1 ? parseFloat(cols[maxIdx]) || 0 : 0,
      meanScore: meanIdx !== -1 ? parseFloat(cols[meanIdx]) || 0 : 0,
    };
  }
  return result;
}

export default function PivotComparison() {
  const [selectedModel, setSelectedModel] = useState<string>(MODELS[0].key);
  const [selectedMetric, setSelectedMetric] = useState<'max' | 'mean'>('max');
  const [normMode, setNormMode] = useState<NormMode>('raw');
  const [swapSelf, setSwapSelf] = useState<boolean>(true);
  const [scoring, setScoring] = useState<'standard' | 'centered'>('standard');
  const [selectedPivots, setSelectedPivots] = useState<string[]>(['english', 'arabic', 'german', 'french', 'basque', 'chinese']);
  const [activeLangs, setActiveLangs] = useState<string[]>(['arb_Arab', 'heb_Hebr', 'fra_Latn', 'hin_Deva', 'pes_Arab']);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageNames, setLanguageNames] = useState<Record<string, string>>({});
  
  const [pivotData, setPivotData] = useState<Record<string, Record<string, LangRow>>>({});
  const [loading, setLoading] = useState(true);
  const [spearman, setSpearman] = useState<{
    pivots: string[];
    models: Record<string, { label: string; nLangs: number; rho: Record<string, Record<string, number>> }>;
  } | null>(null);

  // Spearman rank correlations across pivots (precomputed, standard scoring, max-pooled)
  useEffect(() => {
    fetch('/data/spearman_flores_table1_100.json')
      .then((r) => (r.ok ? r.json() : null))
      .then(setSpearman)
      .catch((err) => console.error('Failed to load spearman data:', err));
  }, []);

  // Fetch language names
  useEffect(() => {
    fetch('/data/language_names.json')
      .then((r) => r.json())
      .then((names) => {
        const floresNameMap: Record<string, string> = {};
        Object.entries(names).forEach(([key, val]) => {
          floresNameMap[key] = val as string;
        });
        setLanguageNames(floresNameMap);
      })
      .catch((err) => console.error('Failed to load language names:', err));
  }, []);

  // Fetch experiment data when model changes
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const model = MODELS.find(m => m.key === selectedModel);
      if (!model) return;

      // Centered scoring: embeddings are mean-centered per language before
      // cosine, removing the per-pivot compression that makes raw scores
      // incomparable across pivots. Files carry a `centered_` name segment.
      const seg = scoring === 'centered' ? 'centered_' : '';
      const grab = (url: string) => fetch(url).then(r => (r.ok ? r.text() : ''));
      try {
        const [engText, arText, deText, frText, basText, zhoText] = await Promise.all([
          grab(`/data/flores_table1_100_${model.csvSuffix}_${seg}results.csv`),
          grab(`/data/flores_table1_100_${model.csvSuffix}_arabic_pivot_${seg}results.csv`),
          grab(`/data/flores_table1_100_${model.csvSuffix}_german_pivot_${seg}results.csv`),
          grab(`/data/flores_table1_100_${model.csvSuffix}_french_pivot_${seg}results.csv`),
          grab(`/data/flores_table1_100_${model.csvSuffix}_basque_pivot_${seg}results.csv`),
          grab(`/data/flores_table1_100_${model.csvSuffix}_chinese_pivot_${seg}results.csv`)
        ]);

        setPivotData({
          english: parseCSV(engText, model.maxCol, model.meanCol),
          arabic: parseCSV(arText, model.maxCol, model.meanCol),
          german: parseCSV(deText, model.maxCol, model.meanCol),
          french: parseCSV(frText, model.maxCol, model.meanCol),
          basque: parseCSV(basText, model.maxCol, model.meanCol),
          chinese: parseCSV(zhoText, model.maxCol, model.meanCol)
        });
      } catch (err) {
        console.error('Failed to load pivot comparison data:', err);
      }
      setLoading(false);
    }
    loadData();
  }, [selectedModel, scoring]);

  // Active Model Config
  const activeModel = useMemo(() => MODELS.find(m => m.key === selectedModel)!, [selectedModel]);

  // Supervisor's swap: a pivot's own self-cell is a trivial 1.0 (e.g. arb_Arab
  // under the Arabic pivot is Arabic-vs-Arabic). When enabled, replace it with
  // that pivot's alignment to English (= the eng_Latn row in the same pivot's
  // data, equal to MEXA(eng, pivot) by symmetry) so the pivot language gets a
  // meaningful, English-anchored value instead of 1.0.
  const effectivePivotData = useMemo(() => {
    if (!swapSelf) return pivotData;
    const out: Record<string, Record<string, LangRow>> = {};
    PIVOT_LANGUAGES.forEach(p => {
      const data = pivotData[p.key];
      if (!data) return;
      // English pivot's self-cell is eng↔eng, genuinely trivial, leave as-is.
      const engRow = data['eng_Latn'];
      if (p.code === 'eng_Latn' || !engRow || !data[p.code]) {
        out[p.key] = data;
        return;
      }
      out[p.key] = {
        ...data,
        [p.code]: { ...data[p.code], maxScore: engRow.maxScore, meanScore: engRow.meanScore },
      };
    });
    return out;
  }, [pivotData, swapSelf]);

  // Per-pivot baseline statistics (mean / std / sorted values), computed for the
  // selected metric. The pivot's own self-cell (e.g. arb_Arab under the Arabic
  // pivot) is excluded: when not swapped it is a trivial 1.0; when swapped it
  // duplicates the eng_Latn row, which is already counted. Either way it would
  // bias the baseline.
  const pivotStats = useMemo(() => {
    const stats: Record<string, PivotStat> = {};
    PIVOT_LANGUAGES.forEach(p => {
      const data = effectivePivotData[p.key] || {};
      const vals = Object.entries(data)
        .filter(([code]) => code !== p.code)
        .map(([, row]) => (selectedMetric === 'max' ? row.maxScore : row.meanScore));
      const n = vals.length || 1;
      const mean = vals.reduce((a, b) => a + b, 0) / n;
      const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
      const std = Math.sqrt(variance) || 1;
      stats[p.key] = { mean, std, sorted: [...vals].sort((a, b) => a - b) };
    });
    return stats;
  }, [effectivePivotData, selectedMetric]);

  // Transform a raw score into the active normalization space.
  const transform = useMemo(() => {
    return (pivotKey: string, raw: number): number => {
      if (normMode === 'raw') return raw;
      const s = pivotStats[pivotKey];
      if (!s) return raw;
      if (normMode === 'zscore') return (raw - s.mean) / s.std;
      // percentile: fraction of (non-self) values <= raw
      const arr = s.sorted;
      if (!arr.length) return 0;
      let count = 0;
      for (let i = 0; i < arr.length; i++) if (arr[i] <= raw) count++;
      return count / arr.length;
    };
  }, [normMode, pivotStats]);

  // Compute best and worst aligned target languages for each pivot
  const pivotExtremes = useMemo(() => {
    const extremes: Record<string, {
      best: { code: string; name: string; score: number; rawScore: number } | null;
      worst: { code: string; name: string; score: number; rawScore: number } | null;
    }> = {};

    PIVOT_LANGUAGES.forEach(p => {
      const data = effectivePivotData[p.key];
      if (!data) {
        extremes[p.key] = { best: null, worst: null };
        return;
      }

      // Filter out the pivot language itself to find the best/worst other languages
      const entries = Object.entries(data).filter(([code]) => code !== p.code);
      if (entries.length === 0) {
        extremes[p.key] = { best: null, worst: null };
        return;
      }

      let bestEntry: [string, LangRow] | null = null;
      let worstEntry: [string, LangRow] | null = null;
      let bestVal = -Infinity;
      let worstVal = Infinity;

      entries.forEach(([code, row]) => {
        const val = selectedMetric === 'max' ? row.maxScore : row.meanScore;
        if (val > bestVal) {
          bestVal = val;
          bestEntry = [code, row];
        }
        if (val < worstVal) {
          worstVal = val;
          worstEntry = [code, row];
        }
      });

      const getLangName = (code: string) => {
        const iso = code.split('_')[0];
        return languageNames[iso] || code;
      };

      extremes[p.key] = {
        best: bestEntry ? {
          code: bestEntry[0],
          name: getLangName(bestEntry[0]),
          score: transform(p.key, bestVal),
          rawScore: bestVal
        } : null,
        worst: worstEntry ? {
          code: worstEntry[0],
          name: getLangName(worstEntry[0]),
          score: transform(p.key, worstVal),
          rawScore: worstVal
        } : null
      };
    });

    return extremes;
  }, [effectivePivotData, selectedMetric, languageNames, transform]);


  // Available Languages list based on English pivot keys
  const availableLangs = useMemo(() => {
    const engData = effectivePivotData['english'] || {};
    return Object.keys(engData).map(code => {
      const iso = code.split('_')[0];
      return {
        code,
        name: languageNames[iso] || code
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [effectivePivotData, languageNames]);

  // Filtered available languages for dropdown/sidebar selector
  const filteredAvailable = useMemo(() => {
    if (!searchTerm) return availableLangs.slice(0, 50);
    const q = searchTerm.toLowerCase();
    return availableLangs.filter(l => 
      l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q)
    );
  }, [availableLangs, searchTerm]);

  // Combine and format data for the Chart
  const chartData = useMemo(() => {
    return activeLangs.map(code => {
      const iso = code.split('_')[0];
      const name = languageNames[iso] || code;
      
      const row: any = {
        code,
        name,
      };

      selectedPivots.forEach(pivotKey => {
        const pData = effectivePivotData[pivotKey] || {};
        const pRow = pData[code];
        const raw = pRow ? (selectedMetric === 'max' ? pRow.maxScore : pRow.meanScore) : 0;
        row[pivotKey] = transform(pivotKey, raw);
      });

      return row;
    });
  }, [activeLangs, effectivePivotData, selectedPivots, selectedMetric, languageNames, transform]);

  const togglePivot = (pivotKey: string) => {
    setSelectedPivots(prev => 
      prev.includes(pivotKey) 
        ? prev.filter(k => k !== pivotKey) 
        : [...prev, pivotKey]
    );
  };

  const toggleLang = (code: string) => {
    setActiveLangs(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-surface-container-highest/95 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-xl animate-in fade-in zoom-in duration-300">
        <p className="font-headline font-bold text-sm text-primary mb-3 uppercase tracking-wider">{label}</p>
        <div className="space-y-2">
          {payload.map((p: any, i: number) => {
            const pivotConf = PIVOT_LANGUAGES.find(pl => pl.key === p.name);
            return (
              <div key={i} className="flex justify-between items-center gap-6 text-xs font-body">
                <span className="text-on-surface-variant flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.fill }} />
                  {pivotConf?.label || p.name} Pivot
                </span>
                <span className="font-mono font-bold text-on-surface">{fmtVal(normMode, p.value as number)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // DataTable columns
  const tableColumns = useMemo(() => [
    {
      key: 'rank',
      label: '#',
      align: 'center' as const,
      sortable: true,
      render: (val: any) => (
        <span className="text-xs font-mono font-bold text-on-surface-variant">{val}</span>
      )
    },
    {
      key: 'name',
      label: 'Language',
      sortable: true,
      render: (val: any, row: any) => (
        <div>
          <span className="font-headline font-bold text-sm text-on-surface">{val}</span>
          <span className="block font-mono text-[10px] text-on-surface-variant">{row.code}</span>
        </div>
      )
    },
    {
      key: 'english',
      label: 'English Pivot',
      align: 'center' as const,
      sortable: true,
      render: (val: any) => (
        <div className="flex items-center justify-center gap-2">
          <div className="w-12 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${barFraction(normMode, val) * 100}%` }} />
          </div>
          <span className="text-xs font-mono font-bold text-blue-600">{fmtVal(normMode, val || 0)}</span>
        </div>
      )
    },
    {
      key: 'arabic',
      label: 'Arabic Pivot',
      align: 'center' as const,
      sortable: true,
      render: (val: any) => (
        <div className="flex items-center justify-center gap-2">
          <div className="w-12 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${barFraction(normMode, val) * 100}%` }} />
          </div>
          <span className="text-xs font-mono font-bold text-amber-600">{fmtVal(normMode, val || 0)}</span>
        </div>
      )
    },
    {
      key: 'german',
      label: 'German Pivot',
      align: 'center' as const,
      sortable: true,
      render: (val: any) => (
        <div className="flex items-center justify-center gap-2">
          <div className="w-12 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${barFraction(normMode, val) * 100}%` }} />
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600">{fmtVal(normMode, val || 0)}</span>
        </div>
      )
    },
    {
      key: 'french',
      label: 'French Pivot',
      align: 'center' as const,
      sortable: true,
      render: (val: any) => (
        <div className="flex items-center justify-center gap-2">
          <div className="w-12 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${barFraction(normMode, val) * 100}%` }} />
          </div>
          <span className="text-xs font-mono font-bold text-purple-600">{fmtVal(normMode, val || 0)}</span>
        </div>
      )
    },
    {
      key: 'basque',
      label: 'Basque Pivot',
      align: 'center' as const,
      sortable: true,
      render: (val: any) => (
        <div className="flex items-center justify-center gap-2">
          <div className="w-12 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${barFraction(normMode, val) * 100}%` }} />
          </div>
          <span className="text-xs font-mono font-bold text-rose-600">{fmtVal(normMode, val || 0)}</span>
        </div>
      )
    },
    {
      key: 'chinese',
      label: 'Chinese Pivot',
      align: 'center' as const,
      sortable: true,
      render: (val: any) => (
        <div className="flex items-center justify-center gap-2">
          <div className="w-12 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-cyan-600 rounded-full" style={{ width: `${barFraction(normMode, val) * 100}%` }} />
          </div>
          <span className="text-xs font-mono font-bold text-cyan-600">{fmtVal(normMode, val || 0)}</span>
        </div>
      )
    }
  ], [languageNames, normMode]);

  // DataTable rows mapping
  const tableData = useMemo(() => {
    const items = availableLangs.map((lang) => {
      const row: any = { code: lang.code, name: lang.name };
      PIVOT_LANGUAGES.forEach(p => {
        const pRow = (effectivePivotData[p.key] || {})[lang.code];
        const raw = pRow ? (selectedMetric === 'max' ? pRow.maxScore : pRow.meanScore) : 0;
        row[p.key] = transform(p.key, raw);
      });
      return row;
    });

    // Sort by english desc
    items.sort((a, b) => b.english - a.english);

    return items.map((item, idx) => ({
      rank: idx + 1,
      ...item
    }));
  }, [availableLangs, effectivePivotData, selectedMetric, transform]);

  return (
    <div className="p-12 space-y-12">
      {/* Page Header */}
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-3">
          <span className="material-symbols-outlined text-3xl text-primary">swap_horiz</span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            Comparative Analysis
          </span>
        </div>
        <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight mb-4">
          Pivot Language Comparison
        </h2>
        <p className="text-on-surface-variant font-body leading-relaxed max-w-2xl italic">
          Compare MEXA alignment scores across different pivot languages. Holding the model constant, 
          this shows how the semantic alignment behaves when changing the reference pivot language 
          from English to Arabic.
        </p>
      </div>

      {/* Models MEXA Score Comparison Table */}
      <section className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
        <div className="mb-6 max-w-5xl">
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-3">
            MEXA Score Comparison · Models × Pivot Languages
            <span className={`text-[9px] px-2.5 py-1 rounded-full tracking-widest ${scoring === 'centered' ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
              {scoring === 'centered' ? 'CENTERED SCORING' : 'STANDARD SCORING'}
            </span>
          </h3>
          <p className="text-xs text-on-surface-variant font-body leading-relaxed">
            Comparing the overall model alignment scores on <strong>FLORES Table 1 (100 sentences)</strong> when changing the pivot language from <strong>English (eng_Latn)</strong> to <strong>Arabic (arb_Arab)</strong>, <strong>German (deu_Latn)</strong>, <strong>French (fra_Latn)</strong>, <strong>Basque (eus_Latn)</strong>, a language isolate, included as a maximally peripheral pivot, and <strong>Chinese (zho_Hans)</strong>, high-resource but non-Latin script, separating resource level from script effects.{' '}
            {scoring === 'standard'
              ? <>Under standard scoring, non-English pivots yield systematically <strong>higher</strong> means, not better alignment, but an easier discrimination test: each pivot's own representational geometry sets the difficulty (see the Margin Analysis page).</>
              : <>Under centered scoring (embeddings mean-centered per language before cosine), the cross-pivot offset largely disappears and the means become nearly equal, confirming the standard-scoring gap is a geometry artifact, at the cost of scores saturating toward 1.0.</>}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th
                  rowSpan={2}
                  className="text-left text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-4 py-3 align-bottom"
                >
                  Model
                </th>
                <th
                  colSpan={2}
                  className="text-center text-[10px] font-bold uppercase tracking-widest text-primary px-4 pt-3 pb-1 border-l border-outline-variant/20"
                >
                  English Pivot (eng_Latn)
                </th>
                <th
                  colSpan={2}
                  className="text-center text-[10px] font-bold uppercase tracking-widest text-primary px-4 pt-3 pb-1 border-l border-outline-variant/20"
                >
                  Arabic Pivot (arb_Arab)
                </th>
                <th
                  colSpan={2}
                  className="text-center text-[10px] font-bold uppercase tracking-widest text-emerald-600 px-4 pt-3 pb-1 border-l border-outline-variant/20"
                >
                  German Pivot (deu_Latn)
                </th>
                <th
                  colSpan={2}
                  className="text-center text-[10px] font-bold uppercase tracking-widest text-purple-600 px-4 pt-3 pb-1 border-l border-outline-variant/20"
                >
                  French Pivot (fra_Latn)
                </th>
                <th
                  colSpan={2}
                  className="text-center text-[10px] font-bold uppercase tracking-widest text-rose-600 px-4 pt-3 pb-1 border-l border-outline-variant/20"
                >
                  Basque Pivot (eus_Latn)
                </th>
                <th
                  colSpan={2}
                  className="text-center text-[10px] font-bold uppercase tracking-widest text-cyan-600 px-4 pt-3 pb-1 border-l border-outline-variant/20"
                >
                  Chinese Pivot (zho_Hans)
                </th>
              </tr>
              <tr className="border-b border-outline-variant/30">
                <th className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2 border-l border-outline-variant/20">µ_Max</th>
                <th className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2">µ_Mean</th>
                <th className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2 border-l border-outline-variant/20">µ_Max</th>
                <th className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2">µ_Mean</th>
                <th className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2 border-l border-outline-variant/20">µ_Max</th>
                <th className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2">µ_Mean</th>
                <th className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2 border-l border-outline-variant/20">µ_Max</th>
                <th className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2">µ_Mean</th>
                <th className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2 border-l border-outline-variant/20">µ_Max</th>
                <th className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2">µ_Mean</th>
                <th className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2 border-l border-outline-variant/20">µ_Max</th>
                <th className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2">µ_Mean</th>
              </tr>
            </thead>
            <tbody>
              {SUMMARY_ROWS[scoring].map((row, idx) => {
                return (
                  <tr
                    key={row.model}
                    className="border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-headline font-semibold text-on-surface">
                        {row.model}
                      </div>
                    </td>
                    <td className="text-right font-mono tabular-nums text-base px-3 py-3 border-l border-outline-variant/20 font-semibold text-on-surface-variant">
                      {row.engMax.toFixed(4)}
                    </td>
                    <td className="text-right font-mono tabular-nums text-base px-3 py-3 font-semibold text-on-surface-variant">
                      {row.engMean.toFixed(4)}
                    </td>
                    <td className="text-right font-mono tabular-nums text-base px-3 py-3 border-l border-outline-variant/20 font-bold text-amber-600">
                      {row.arMax.toFixed(4)}
                    </td>
                    <td className="text-right font-mono tabular-nums text-base px-3 py-3 font-bold text-amber-600">
                      {row.arMean.toFixed(4)}
                    </td>
                    <td className="text-right font-mono tabular-nums text-base px-3 py-3 border-l border-outline-variant/20 font-bold text-emerald-600">
                      {row.deMax.toFixed(4)}
                    </td>
                    <td className="text-right font-mono tabular-nums text-base px-3 py-3 font-bold text-emerald-600">
                      {row.deMean.toFixed(4)}
                    </td>
                    <td className="text-right font-mono tabular-nums text-base px-3 py-3 border-l border-outline-variant/20 font-bold text-purple-600">
                      {row.frMax.toFixed(4)}
                    </td>
                    <td className="text-right font-mono tabular-nums text-base px-3 py-3 font-bold text-purple-600">
                      {row.frMean.toFixed(4)}
                    </td>
                    <td className="text-right font-mono tabular-nums text-base px-3 py-3 border-l border-outline-variant/20 font-bold text-rose-600">
                      {row.basMax != null ? row.basMax.toFixed(4) : '—'}
                    </td>
                    <td className="text-right font-mono tabular-nums text-base px-3 py-3 font-bold text-rose-600">
                      {row.basMean != null ? row.basMean.toFixed(4) : '—'}
                    </td>
                    <td className="text-right font-mono tabular-nums text-base px-3 py-3 border-l border-outline-variant/20 font-bold text-cyan-600">
                      {row.zhoMax != null ? row.zhoMax.toFixed(4) : '—'}
                    </td>
                    <td className="text-right font-mono tabular-nums text-base px-3 py-3 font-bold text-cyan-600">
                      {row.zhoMean != null ? row.zhoMean.toFixed(4) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Analytical Insights under Table */}
        <div className="mt-6 pt-6 border-t border-outline-variant/15 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest/60 rounded-xl p-4 border border-outline-variant/10">
            <div className="flex items-center gap-2 text-xs font-bold font-headline text-primary uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-sm text-blue-500">analytics</span>
              Cross-Pivot Level Shift
            </div>
            <p className="text-[11px] text-on-surface-variant font-body leading-relaxed">
              Under standard scoring, non-English pivots (Arabic, German, French) yield systematically higher means than English across all models. This is a representational geometry artifact (hubness/compression), which largely disappears under centered scoring.
            </p>
          </div>

          <div className="bg-surface-container-lowest/60 rounded-xl p-4 border border-outline-variant/10">
            <div className="flex items-center gap-2 text-xs font-bold font-headline text-rose-600 uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-sm text-rose-500">warning</span>
              Peripheral Pivot Collapse (Basque)
            </div>
            <p className="text-[11px] text-on-surface-variant font-body leading-relaxed">
              For models with weak Basque pretraining (e.g. Mistral 7B: <span className="font-mono font-bold text-rose-600">0.2158</span>), Basque pivot scores drop dramatically. When a model cannot represent the pivot language itself, the reference anchor collapses.
            </p>
          </div>

          <div className="bg-surface-container-lowest/60 rounded-xl p-4 border border-outline-variant/10">
            <div className="flex items-center gap-2 text-xs font-bold font-headline text-emerald-600 uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-sm text-emerald-500">verified</span>
              Multilingual Robustness (Qwen 3.5)
            </div>
            <p className="text-[11px] text-on-surface-variant font-body leading-relaxed">
              Heavily multilingual models like Qwen 3.5 9B maintain high scores across all pivots (<span className="font-mono font-bold text-emerald-600">~0.79-0.80</span>), demonstrating that extensive multilingual pretraining stabilizes cross-lingual geometry regardless of pivot choice.
            </p>
          </div>
        </div>
      </section>

      {/* Controls panel */}
      <div className="flex flex-wrap gap-6 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
        {/* Model Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Selected Model</label>
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-xs font-headline font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 w-60"
          >
            {MODELS.map(m => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Metric Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Pooling Metric</label>
          <div className="bg-surface-container-lowest border border-outline-variant/15 p-1 rounded-xl flex gap-1 h-[45px] items-center">
            <button
              onClick={() => setSelectedMetric('max')}
              className={`px-4 py-1.5 rounded-lg text-xs font-headline font-bold transition-all ${
                selectedMetric === 'max'
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Max Pooling
            </button>
            <button
              onClick={() => setSelectedMetric('mean')}
              className={`px-4 py-1.5 rounded-lg text-xs font-headline font-bold transition-all ${
                selectedMetric === 'mean'
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Mean Pooling
            </button>
          </div>
        </div>

        {/* Scoring Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Scoring</label>
          <div className="bg-surface-container-lowest border border-outline-variant/15 p-1 rounded-xl flex gap-1 h-[45px] items-center">
            {(['standard', 'centered'] as const).map(m => (
              <button
                key={m}
                onClick={() => setScoring(m)}
                title={m === 'centered'
                  ? 'Embeddings mean-centered per language before cosine, removes the per-pivot hubness offset, but scores saturate toward 1.0.'
                  : 'Standard MEXA on raw embeddings.'}
                className={`px-4 py-1.5 rounded-lg text-xs font-headline font-bold transition-all capitalize ${
                  scoring === m
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Normalization Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Normalization</label>
          <div className="bg-surface-container-lowest border border-outline-variant/15 p-1 rounded-xl flex gap-1 h-[45px] items-center">
            {NORM_MODES.map(m => (
              <button
                key={m.key}
                onClick={() => setNormMode(m.key)}
                className={`px-4 py-1.5 rounded-lg text-xs font-headline font-bold transition-all ${
                  normMode === m.key
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Self-cell Swap Toggle */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Pivot Self-Score</label>
          <button
            onClick={() => setSwapSelf(v => !v)}
            title="Replace each pivot's trivial self-score (1.0) with its alignment to English (MEXA(eng, pivot))."
            className={`h-[45px] px-4 rounded-xl border text-xs font-headline font-bold transition-all flex items-center gap-2 ${
              swapSelf
                ? 'bg-primary/10 border-primary text-primary shadow-sm'
                : 'bg-surface-container-lowest border-outline-variant/15 text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className={`material-symbols-outlined text-base ${swapSelf ? 'opacity-100' : 'opacity-40'}`}>swap_horiz</span>
            {swapSelf ? 'Swap → English' : 'Raw self (1.0)'}
          </button>
        </div>

        {/* Pivot Checkboxes */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Pivot Languages</label>
          <div className="flex items-center gap-4 h-[45px]">
            {PIVOT_LANGUAGES.map(p => (
              <button
                key={p.key}
                onClick={() => togglePivot(p.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-headline font-bold transition-all ${
                  selectedPivots.includes(p.key)
                    ? 'bg-surface-container-lowest border-primary text-primary shadow-sm'
                    : 'bg-surface-container-lowest/50 border-outline-variant/10 text-on-surface-variant hover:text-primary'
                }`}
              >
                <div 
                  className={`w-2.5 h-2.5 rounded-full ${selectedPivots.includes(p.key) ? 'opacity-100' : 'opacity-30'}`}
                  style={{ backgroundColor: p.color }}
                />
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spearman rank-correlation matrix */}
      {spearman && spearman.models[activeModel.csvSuffix] && (
        <section className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider mb-2">
            Ranking Stability · Spearman ρ between Pivots
          </h3>
          <p className="text-xs text-on-surface-variant font-body leading-relaxed max-w-3xl mb-6">
            Spearman rank correlation of the per-language score ranking between every pair of pivots
            ({activeModel.label}, standard scoring, max-pooled, {spearman.models[activeModel.csvSuffix].nLangs} languages, the six pivot languages are excluded from the ranking set). High ρ means pivot choice barely changes
            <em> which</em> languages rank as well-aligned, even where absolute score levels differ.
          </p>
          <div className="overflow-x-auto">
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="px-3 py-2" />
                  {PIVOT_LANGUAGES.map((p) => (
                    <th key={p.key} className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.code.split('_')[0]}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PIVOT_LANGUAGES.map((rowP) => {
                  const rho = spearman.models[activeModel.csvSuffix].rho;
                  return (
                    <tr key={rowP.key}>
                      <td className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: rowP.color }} />
                          {rowP.code.split('_')[0]}
                        </span>
                      </td>
                      {PIVOT_LANGUAGES.map((colP) => {
                        const v = rho[rowP.code]?.[colP.code];
                        if (v == null) return <td key={colP.key} className="px-3 py-2 text-center text-xs text-on-surface-variant/40">—</td>;
                        const diag = rowP.code === colP.code;
                        const alpha = diag ? 0 : Math.max(0, Math.min(0.4, ((v - 0.65) / 0.35) * 0.4));
                        return (
                          <td
                            key={colP.key}
                            className={`px-3 py-2 text-center font-mono text-xs tabular-nums ${diag ? 'text-on-surface-variant/40' : 'font-bold text-on-surface'}`}
                            style={{ backgroundColor: `rgba(59, 130, 246, ${alpha})` }}
                          >
                            {v.toFixed(3)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-on-surface-variant/70 font-body mt-4 max-w-3xl">
            Across all five models, high-resource pivots correlate with English at ρ ≈ 0.91, 0.98, pivot choice is
            nearly ranking-invariant. Basque is the exception (ρ as low as 0.73 for Mistral and Qwen3 4B): when the
            model barely represents the pivot itself, even the <em>ranking</em> degrades, not just the score level.
          </p>
        </section>
      )}

      {loading ? (
        <div className="w-full h-[300px] flex flex-col items-center justify-center gap-4 text-on-surface-variant/40">
          <span className="icon text-3xl animate-spin">refresh</span>
          <span className="text-[10px] uppercase font-bold tracking-widest">Loading Pivot Scores...</span>
        </div>
      ) : (
        <>
          {/* Extreme Alignments per Pivot */}
          <section className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10 space-y-6">
            <div>
              <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary/70">trending_up</span>
                Extreme Alignments per Pivot
              </h3>
              <p className="text-xs text-on-surface-variant font-body leading-relaxed max-w-3xl">
                The best and worst performing target languages (excluding the pivot language itself) for each reference pivot, showing how alignment quality shifts depending on the reference language chosen.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {PIVOT_LANGUAGES.map(p => {
                const extremes = pivotExtremes[p.key];
                if (!extremes || !extremes.best || !extremes.worst) return null;
                return (
                  <div key={p.key} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10 flex flex-col justify-between hover:border-primary/30 hover:shadow-md transition-all duration-300">
                    <div>
                      {/* Pivot Header */}
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-outline-variant/5">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="font-headline font-bold text-xs text-on-surface truncate" title={p.label}>{p.label.split(' ')[0]}</span>
                      </div>

                      {/* Best Language */}
                      <div className="mb-4">
                        <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                          <span className="material-symbols-outlined text-[10px]">thumb_up</span>
                          Best Target
                        </div>
                        <div className="font-headline font-bold text-xs text-on-surface truncate" title={extremes.best.name}>
                          {extremes.best.name}
                        </div>
                        <div className="font-mono text-[9px] text-on-surface-variant mb-1">{extremes.best.code}</div>
                        <div className="flex items-baseline gap-1 flex-wrap">
                          <span className="font-mono font-bold text-xs text-emerald-600">{fmtVal(normMode, extremes.best.score)}</span>
                          {normMode !== 'raw' && (
                            <span className="font-mono text-[9px] text-on-surface-variant">({extremes.best.rawScore.toFixed(3)})</span>
                          )}
                        </div>
                      </div>

                      {/* Worst Language */}
                      <div>
                        <div className="flex items-center gap-1 text-[9px] font-bold text-rose-600 uppercase tracking-wider mb-1">
                          <span className="material-symbols-outlined text-[10px]">thumb_down</span>
                          Worst Target
                        </div>
                        <div className="font-headline font-bold text-xs text-on-surface truncate" title={extremes.worst.name}>
                          {extremes.worst.name}
                        </div>
                        <div className="font-mono text-[9px] text-on-surface-variant mb-1">{extremes.worst.code}</div>
                        <div className="flex items-baseline gap-1 flex-wrap">
                          <span className="font-mono font-bold text-xs text-rose-600">{fmtVal(normMode, extremes.worst.score)}</span>
                          {normMode !== 'raw' && (
                            <span className="font-mono text-[9px] text-on-surface-variant">({extremes.worst.rawScore.toFixed(3)})</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="bg-surface-container-low p-10 rounded-2xl relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 group">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 relative z-10">

            <div>
              <h3 className="text-xl font-headline font-extrabold text-primary mb-1 uppercase tracking-widest flex items-center gap-3">
                <span className="icon text-primary/70">compare_arrows</span>
                Cross-Pivot Delta Variance
              </h3>
              <p className="text-xs text-on-surface-variant font-label uppercase tracking-[0.1em] opacity-70">
                Alignment comparison holding model '{activeModel.label}' constant
              </p>
              {normMode !== 'raw' && (
                <p className="text-[11px] text-primary/80 font-body mt-2 max-w-xl normal-case tracking-normal">
                  {normMode === 'zscore'
                    ? 'Z-Score: each pivot’s scores are standardized (mean 0, std 1) using that pivot’s own distribution, so values are comparable across pivots. The pivot’s trivial self-score is excluded from the baseline.'
                    : 'Percentile: each score is its rank within its own pivot’s distribution (0, 100%), removing the systematic level offset between pivots. The pivot’s trivial self-score is excluded from the baseline.'}
                </p>
              )}
              {swapSelf && (
                <p className="text-[11px] text-primary/80 font-body mt-1 max-w-xl normal-case tracking-normal">
                  Self-score swap: each non-English pivot’s own row shows its alignment to English, MEXA(eng, pivot), instead of the trivial 1.0 self-similarity.
                </p>
              )}
              {scoring === 'centered' && (
                <p className="text-[11px] text-primary/80 font-body mt-1 max-w-xl normal-case tracking-normal">
                  Centered scoring: each language’s embeddings are mean-centered per layer before cosine similarity, removing the pivot-specific hubness offset so raw
                  scores are nearly comparable across pivots. Caveat: scores saturate toward 1.0, reducing discrimination between languages.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 bg-surface-container-lowest/50 p-1.5 rounded-xl border border-outline-variant/10 backdrop-blur-sm">
              <div className="relative">
                <span className="icon absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 text-sm">search</span>
                <input
                  type="text"
                  placeholder="Add target languages..."
                  className="pl-9 pr-4 py-2 bg-transparent text-xs font-label text-on-surface placeholder:text-on-surface-variant/40 outline-none w-56"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8 relative z-10">
            {/* Target Cohort Selector Sidebar */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Selected Targets</h4>
                <div className="flex flex-wrap gap-2">
                  {activeLangs.map(code => {
                    const iso = code.split('_')[0];
                    return (
                      <button 
                        key={code} 
                        onClick={() => toggleLang(code)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary rounded-lg hover:bg-primary/20 transition-all group/btn"
                      >
                        {languageNames[iso] || code}
                        <span className="icon text-[12px] opacity-40 group-hover/btn:opacity-100">close</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-outline-variant/10">
                 <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Available Targets</h4>
                 <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-1">
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

            {/* Main Bar Chart */}
            <div className="col-span-12 lg:col-span-9 bg-surface-container-lowest/30 rounded-2xl p-6 border border-outline-variant/10 min-h-[450px]">
              <ResponsiveContainer width="100%" height={420}>
                <BarChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e4" vertical={false} opacity={0.5} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#3f484c" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontWeight: 600 } as any}
                    dy={10}
                  />
                  <YAxis
                    domain={normMode === 'zscore' ? [-3, 3] : [0, 1]}
                    stroke="#3f484c"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => normMode === 'percentile' ? `${(v * 100).toFixed(0)}%` : v.toFixed(1)}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 70, 85, 0.03)' }} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: 0, paddingBottom: 30, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}
                  />
                  {selectedPivots.map(pivotKey => {
                    const pivotConf = PIVOT_LANGUAGES.find(pl => pl.key === pivotKey);
                    return (
                      <Bar
                        key={pivotKey}
                        dataKey={pivotKey}
                        name={pivotKey}
                        fill={pivotConf?.color || '#94d2bd'}
                        radius={[4, 4, 0, 0]}
                        barSize={selectedPivots.length === 1 ? 32 : 18}
                        fillOpacity={0.85}
                        className="transition-all duration-300"
                      />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Comparison Data Table */}
        <div className="bg-surface-container-low p-10 rounded-2xl border border-outline-variant/10">
          <DataTable
            title="Model Score Comparison by Pivot Language"
            subtitle={`${activeModel.label} / FLORES Table 1 (100 sents)`}
            columns={tableColumns}
            data={tableData}
            rowsPerPage={15}
            enableSearch
            searchPlaceholder="Search by language name or code..."
            enableSorting
            enableExport
            exportFilename={`pivot-comparison-${activeModel.csvSuffix}-${selectedMetric}`}
            enableDensityToggle
          />
        </div>
      </>
      )}
    </div>
  );
}
