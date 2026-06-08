import { useState, useEffect } from 'react';
import { ExperimentTimeline } from '../ui/ExperimentTimeline';
import { ScoreVsSizeChart, type SizeChartRow } from '../charts/ScoreVsSizeChart';
import { ScoreHistogramChart } from '../charts/ScoreHistogramChart';

/* ── Data helpers ── */
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

/* ── MEXA Score Comparison Table ──
   Edit MEXA_SCORES below to add results as experiments complete.
   Use `null` for entries you don't have yet — they render as "—". */
export type Score = number | null;
export type Variant = 'flores-table1' | 'flores-table1-2000' | 'bible-table1' | 'flores-full' | 'bible-full';
export type ModelRow = {
  model: string;
  note?: string;
  scores: Record<Variant, { max: Score; mean: Score }>;
};

export const VARIANT_COLUMNS: { key: Variant; label: string; subtitle: string }[] = [
  // FLORES experiments first, then Bible experiments
  { key: 'flores-table1', label: 'FLORES Table 1', subtitle: '116 langs · 100 sents' },
  { key: 'flores-table1-2000', label: 'FLORES Table 1', subtitle: '116 langs · 2000 sents' },
  { key: 'flores-full', label: 'FLORES Full', subtitle: '204 langs · 2000 sents' },
  { key: 'bible-table1', label: 'Bible Table 1', subtitle: '101 langs · sPBC' },
  { key: 'bible-full', label: 'Bible Full', subtitle: 'sPBC · all langs' },
];

const blank = (): Record<Variant, { max: Score; mean: Score }> => ({
  'flores-table1': { max: null, mean: null },
  'flores-table1-2000': { max: null, mean: null },
  'bible-table1': { max: null, mean: null },
  'flores-full': { max: null, mean: null },
  'bible-full': { max: null, mean: null },
});

export const MEXA_SCORES: ModelRow[] = [
  {
    model: 'Paper · Llama 3.1 8B',
    note: 'reference (Kargaran et al., 2025)',
    scores: {
      ...blank(),
      'flores-table1': { max: 0.6538, mean: 0.3963 },
      'bible-table1': { max: 0.4212, mean: 0.2103 },
    },
  },
  {
    model: 'Paper · Mistral 7B v0.3',
    note: 'reference (Kargaran et al., 2025)',
    scores: {
      ...blank(),
      'flores-table1': { max: 0.4716, mean: 0.2642 },
      'bible-table1': { max: 0.2606, mean: 0.1198 },
    },
  },
  {
    model: 'Llama 3.1 8B',
    scores: {
      'flores-table1': { max: 0.6735, mean: 0.4196 },
      'flores-table1-2000': { max: 0.6065, mean: 0.3370 },
      'bible-table1': { max: 0.4180, mean: 0.2076 },
      'flores-full': { max: 0.5611, mean: 0.3235 },
      'bible-full': { max: 0.0781, mean: 0.0320 },
    },
  },
  {
    model: 'Mistral 7B v0.3',
    scores: {
      'flores-table1': { max: 0.4980, mean: 0.2878 },
      'flores-table1-2000': { max: 0.4066, mean: 0.2127 },
      'bible-table1': { max: 0.2571, mean: 0.1179 },
      'flores-full': { max: 0.4102, mean: 0.2232 },
      'bible-full': { max: 0.0465, mean: 0.0181 },
    },
  },
  {
    model: 'Qwen3 8B Base',
    scores: {
      'flores-table1': { max: 0.5759, mean: 0.3211 },
      'flores-table1-2000': { max: 0.4838, mean: 0.2416 },
      'bible-table1': { max: 0.2970, mean: 0.1350 },
      'flores-full': { max: 0.4723, mean: 0.2509 },
      'bible-full': { max: 0.0499, mean: 0.0186 },
    },
  },
  {
    model: 'Qwen3.5 9B Base',
    scores: {
      'flores-table1': { max: 0.7814, mean: 0.5557 },
      'flores-table1-2000': { max: 0.7193, mean: 0.4748 },
      'bible-table1': { max: 0.4821, mean: 0.2624 },
      'flores-full': { max: 0.5901, mean: 0.3727 },
      'bible-full': { max: 0.0845, mean: 0.0382 },
    },
  },
  {
    model: 'Apertus 8B',
    scores: {
      'flores-table1': { max: 0.3873, mean: 0.1637 },
      'flores-table1-2000': { max: 0.2827, mean: 0.1176 },
      'bible-table1': { max: 0.4299, mean: 0.1896 },
      'flores-full': { max: 0.3264, mean: 0.1267 },
      'bible-full': { max: 0.0667, mean: 0.0237 },
    },
  },
];

export const QWEN3_SCORES: ModelRow[] = [
  {
    model: 'Qwen3 8B Base',
    scores: {
      'flores-table1': { max: 0.5759, mean: 0.3211 },
      'flores-table1-2000': { max: 0.4838, mean: 0.2416 },
      'bible-table1': { max: 0.2970, mean: 0.1350 },
      'flores-full': { max: 0.4723, mean: 0.2509 },
      'bible-full': { max: 0.0499, mean: 0.0186 },
    },
  },
  {
    model: 'Qwen3.5 9B Base',
    scores: {
      'flores-table1': { max: 0.7814, mean: 0.5557 },
      'flores-table1-2000': { max: 0.7193, mean: 0.4748 },
      'bible-table1': { max: 0.4821, mean: 0.2624 },
      'flores-full': { max: 0.5901, mean: 0.3727 },
      'bible-full': { max: 0.0845, mean: 0.0382 },
    },
  },
  {
    model: 'Qwen3 4B',
    scores: {
      ...blank(),
      'flores-table1': { max: 0.4433, mean: 0.2327 },
      'flores-table1-2000': { max: 0.3506, mean: 0.1658 },
      'bible-table1': { max: 0.1981, mean: 0.0918 },
      'flores-full': { max: 0.2633, mean: 0.1200 },
      'bible-full': { max: 0.0315, mean: 0.0120 },
    },
  },
  {
    model: 'Qwen3 1.7B',
    scores: {
      ...blank(),
      'flores-table1': { max: 0.4946, mean: 0.2158 },
      'flores-table1-2000': { max: 0.4136, mean: 0.1531 },
      'bible-table1': { max: 0.1541, mean: 0.0612 },
      'flores-full': { max: 0.3042, mean: 0.1106 },
      'bible-full': { max: 0.0221, mean: 0.0072 },
    },
  },
  {
    model: 'Qwen3 0.6B',
    scores: {
      ...blank(),
      'flores-table1': { max: 0.3518, mean: 0.1504 },
      'flores-table1-2000': { max: 0.2600, mean: 0.0936 },
      'bible-table1': { max: 0.1340, mean: 0.0466 },
      'flores-full': { max: 0.1815, mean: 0.0639 },
      'bible-full': { max: 0.0235, mean: 0.0067 },
    },
  }
];

export const ENCODER_SCORES: ModelRow[] = [
  {
    model: 'XLM-RoBERTa large',
    note: 'masked-LM encoder · 550M',
    scores: {
      'flores-table1': { max: 0.6474, mean: 0.4308 },
      'flores-table1-2000': { max: 0.5877, mean: 0.3534 },
      'bible-table1': { max: 0.4084, mean: 0.1922 },
      'flores-full': { max: 0.4297, mean: 0.2487 },
      'bible-full': { max: 0.0520, mean: 0.0222 },
    },
  },
  {
    model: 'LaBSE',
    note: 'dual-encoder (sentence-transformers) · 471M',
    scores: {
      'flores-table1': { max: 0.9515, mean: 0.7255 },
      'flores-table1-2000': { max: 0.9141, mean: 0.6683 },
      'bible-table1': { max: 0.8392, mean: 0.5088 },
      'flores-full': { max: 0.8011, mean: 0.5290 },
      'bible-full': { max: 0.1998, mean: 0.0820 },
    },
  },
  {
    model: 'Multilingual E5 base',
    note: 'dual-encoder (sentence-transformers) · 278M',
    scores: {
      'flores-table1': { max: 0.9713, mean: 0.5415 },
      'flores-table1-2000': { max: 0.9505, mean: 0.4733 },
      'bible-table1': { max: 0.8960, mean: 0.3237 },
      'flores-full': { max: 0.8768, mean: 0.3740 },
      'bible-full': { max: 0.2046, mean: 0.0528 },
    },
  },
  {
    model: 'Glot500 base',
    note: 'masked-LM encoder · 270M',
    scores: {
      'flores-table1': { max: 0.5926, mean: 0.3949 },
      'flores-table1-2000': { max: 0.4876, mean: 0.2944 },
      'bible-table1': { max: 0.4883, mean: 0.2394 },
      'flores-full': { max: 0.3791, mean: 0.2249 },
      'bible-full': { max: 0.0995, mean: 0.0429 },
    },
  },
  {
    model: 'mmBERT base',
    note: 'masked-LM encoder · 125M',
    scores: {
      'flores-table1': { max: 0.5138, mean: 0.2350 },
      'flores-table1-2000': { max: 0.4185, mean: 0.1712 },
      'bible-table1': { max: 0.2695, mean: 0.1021 },
      'flores-full': { max: 0.3067, mean: 0.1214 },
      'bible-full': { max: 0.0434, mean: 0.0139 },
    },
  },
];

export const EMBEDDING_SCORES: ModelRow[] = [
  {
    model: 'Qwen3-Embedding-8B',
    note: 'causal embedding model · 8B',
    scores: {
      'flores-table1': { max: 0.8479, mean: 0.5144 },
      'flores-table1-2000': { max: 0.7816, mean: 0.4407 },
      'bible-table1': { max: 0.5605, mean: 0.2667 },
      'flores-full': { max: 0.6927, mean: 0.3690 },
      'bible-full': { max: 0.1133, mean: 0.0455 },
    },
  },
  {
    model: 'Qwen3-Embedding-4B',
    note: 'causal embedding model · 4B',
    scores: {
      'flores-table1': { max: 0.8051, mean: 0.4464 },
      'flores-table1-2000': { max: 0.7275, mean: 0.3741 },
      'bible-table1': { max: 0.4876, mean: 0.2267 },
      'flores-full': { max: 0.6400, mean: 0.3042 },
      'bible-full': { max: 0.0935, mean: 0.0359 },
    },
  },
  {
    model: 'Qwen3-Embedding-0.6B',
    note: 'causal embedding model · 600M',
    scores: {
      'flores-table1': { max: 0.7095, mean: 0.3430 },
      'flores-table1-2000': { max: 0.5668, mean: 0.2616 },
      'bible-table1': { max: 0.3514, mean: 0.1557 },
      'flores-full': { max: 0.4852, mean: 0.2072 },
      'bible-full': { max: 0.0706, mean: 0.0256 },
    },
  },
];

const fmt = (v: Score) => (v === null || v === undefined ? '—' : v.toFixed(4));

/* Per-table, per-column maxima so the highest µ_Max / µ_Mean in each experiment
   column can be bolded. Keyed by row object so a single cell renderer can look up
   the maxima for whichever table the row belongs to. */
const columnMaxima = (rows: ModelRow[]): Record<Variant, { max: Score; mean: Score }> => {
  const out = {} as Record<Variant, { max: Score; mean: Score }>;
  for (const v of VARIANT_COLUMNS) {
    let mx: Score = null, mn: Score = null;
    for (const r of rows) {
      const c = r.scores[v.key];
      if (c?.max != null) mx = mx === null ? c.max : Math.max(mx, c.max);
      if (c?.mean != null) mn = mn === null ? c.mean : Math.max(mn, c.mean);
    }
    out[v.key] = { max: mx, mean: mn };
  }
  return out;
};

const ROW_MAXIMA = new Map<ModelRow, Record<Variant, { max: Score; mean: Score }>>();
for (const table of [MEXA_SCORES, QWEN3_SCORES, ENCODER_SCORES, EMBEDDING_SCORES]) {
  const mx = columnMaxima(table);
  for (const r of table) ROW_MAXIMA.set(r, mx);
}

/* Parse the parameter count (in billions) from a model name, e.g.
   "Qwen3.5 9B Base" → 9, "Qwen3 1.7B" → 1.7, "Mistral 7B v0.3" → 7. */
const parseSizeB = (model: string): number => {
  const m = model.match(/(\d+(?:\.\d+)?)\s*B\b/i);
  return m ? parseFloat(m[1]) : NaN;
};

/* Attach a numeric size to each row for the size-vs-score charts, dropping any
   row whose size can't be parsed. */
const toSizeRows = (rows: ModelRow[]): SizeChartRow[] =>
  rows
    .map((r) => ({ model: r.model, sizeB: parseSizeB(r.model), scores: r.scores }))
    .filter((r) => !Number.isNaN(r.sizeB));

// Exclude the paper-reference rows from the all-models chart (their sizes
// duplicate our own runs and would stack on the same X positions).
const ALL_MODEL_SIZE_ROWS = toSizeRows([
  ...MEXA_SCORES.filter((r) => !r.model.startsWith('Paper ·')),
  ...EMBEDDING_SCORES
]);
const QWEN3_SIZE_ROWS = toSizeRows(QWEN3_SCORES);

/* ── Experiment timeline mock ── */
const EXPERIMENT_ENTRIES = [
  { id: 'exp-007', title: 'FLORES-200 Full Sweep — 32 layers', timestamp: '2 Apr 2026, 18:42', status: 'completed', model: 'Llama 3.1 8B', dataset: 'FLORES-200', score: 0.847, duration: '4h 12m' },
  { id: 'exp-006', title: 'Bible Corpus — Max Pooling', timestamp: '1 Apr 2026, 09:15', status: 'completed', model: 'Llama 3.1 8B', dataset: 'Bible', score: 0.791, duration: '3h 08m' },
  { id: 'exp-005', title: 'Mistral Comparison Baseline', timestamp: '31 Mar 2026, 14:30', status: 'running', model: 'Mistral 7B', dataset: 'FLORES-200', duration: '1h 52m' },
  { id: 'exp-004', title: 'Low-Resource Lang Subset (15 langs)', timestamp: '30 Mar 2026, 11:00', status: 'failed', model: 'Gemma 2B', dataset: 'FLORES-200', duration: '0h 34m' },
  { id: 'exp-003', title: 'Phi-3 Layer-wise Analysis', timestamp: '28 Mar 2026, 16:20', status: 'completed', model: 'Phi-3', dataset: 'FLORES-200', score: 0.723, duration: '2h 45m' },
  { id: 'exp-002', title: 'Hindi-English Attention Mapping', timestamp: '27 Mar 2026, 10:05', status: 'completed', model: 'Llama 3.1 8B', dataset: 'Bible', score: 0.812, duration: '1h 20m' },
  { id: 'exp-001', title: 'Initial Setup + Validation Run', timestamp: '25 Mar 2026, 08:30', status: 'queued', model: 'XGLM 4.5B', dataset: 'FLORES-200' },
];

export default function Overview() {
  const [, setLanguageNames] = useState({});
  const [, setAllData] = useState({});
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [langNamesRes, fmb, fma, bmb, bma, llamaCsvRes] = await Promise.all([
          fetch('/data/language_names.json').then((r) => r.json()),
          fetch('/data/flores-max-belebele.csv').then((r) => r.text()),
          fetch('/data/flores-mean-arc.csv').then((r) => r.text()),
          fetch('/data/bible-max-belebele.csv').then((r) => r.text()),
          fetch('/data/bible-mean-arc.csv').then((r) => r.text()),
          fetch('/data/flores_llama3.1_8b_results.csv')
            .then((r) => r.text())
            .catch(() => ''),
        ]);

        const floresNameMap = {};
        const allCsvTexts = [fmb, fma, bmb, bma, llamaCsvRes].filter(Boolean);
        const allFloresCodes = new Set();
        allCsvTexts.forEach((csv) => {
          csv.trim().split('\n').slice(1).forEach((line) => {
            const code = line.split(',')[0];
            if (code) allFloresCodes.add(code);
          });
        });
        allFloresCodes.forEach((floresCode) => {
          const isoCode = floresCode.split('_')[0];
          const baseName = langNamesRes[isoCode];
          floresNameMap[floresCode] = baseName || floresCode;
        });

        setLanguageNames(floresNameMap);
        setAllData({
          'flores-max': parseCSV(fmb),
          'flores-mean': parseCSV(fma),
          'bible-max': parseCSV(bmb),
          'bible-mean': parseCSV(bma),
          my_results: llamaCsvRes ? parseCSV(llamaCsvRes) : null,
        });
      } catch (err) {
        console.error('Failed to load data:', err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="p-12 space-y-12">


      {/* MEXA Score Comparison Table */}
      <section className="bg-surface-container-low rounded-xl p-8">
        <div className="mb-6 max-w-5xl">
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider mb-3">
            MEXA Score Comparison · Models × Dataset Variants
          </h3>
          <p className="text-xs text-on-surface-variant font-body leading-relaxed">
            The original MEXA paper (<em>Kargaran et al., ACL 2025 Findings</em>) reports its
            headline numbers in <strong>Table 1</strong> on the subsets of languages overlapping
            with the Belebele benchmark: <strong>116 languages from FLORES-200</strong> (full
            devtest, 2000 parallel sentences) and <strong>101 languages from the Bible / sPBC
            corpus</strong> (~103 parallel verses). The embedding setting is identical across
            both: layer-wise <strong>weighted-token average</strong> sentence embeddings, English
            as the pivot, alignment computed via cosine-similarity matrices, and final scores
            aggregated by <strong>max-pool</strong> (µ_Max) and <strong>mean-pool</strong>
            (µ_Mean) across all hidden layers. The table below tracks our own runs across these
            and the full-coverage variants — values are filled in as experiments complete
            (entries marked <code className="text-on-surface">—</code> are still pending).
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
                {VARIANT_COLUMNS.map((v) => (
                  <th
                    key={v.key}
                    colSpan={2}
                    className="text-center text-[10px] font-bold uppercase tracking-widest text-primary px-4 pt-3 pb-1 border-l border-outline-variant/20"
                  >
                    <div>{v.label}</div>
                    <div className="text-[9px] font-medium normal-case tracking-normal text-on-surface-variant/70 mt-0.5">
                      {v.subtitle}
                    </div>
                  </th>
                ))}
              </tr>
              <tr className="border-b border-outline-variant/30">
                {VARIANT_COLUMNS.flatMap((v) => [
                  <th
                    key={`${v.key}-max`}
                    className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2 border-l border-outline-variant/20"
                  >
                    µ_Max
                  </th>,
                  <th
                    key={`${v.key}-mean`}
                    className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2"
                  >
                    µ_Mean
                  </th>,
                ])}
              </tr>
            </thead>
            <tbody>
              {MEXA_SCORES.map((row, idx) => {
                const isReference = row.model.startsWith('Paper');
                return (
                  <tr
                    key={row.model}
                    className={`border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors ${
                      isReference ? 'bg-surface-container-lowest/60' : ''
                    } ${idx === MEXA_SCORES.length - 1 ? 'border-b-0' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className={`font-headline font-semibold ${isReference ? 'text-tertiary' : 'text-on-surface'}`}>
                        {row.model}
                      </div>
                      {row.note && (
                        <div className="text-[10px] font-body text-on-surface-variant/70 italic mt-0.5">
                          {row.note}
                        </div>
                      )}
                    </td>
                    {VARIANT_COLUMNS.flatMap((v) => {
                      const cell = row.scores[v.key];
                      const mx = ROW_MAXIMA.get(row);
                      const boldMax = cell.max !== null && mx != null && cell.max === mx[v.key].max;
                      const boldMean = cell.mean !== null && mx != null && cell.mean === mx[v.key].mean;
                      return [
                        <td
                          key={`${row.model}-${v.key}-max`}
                          className={`text-right font-mono tabular-nums text-base px-3 py-3 border-l border-outline-variant/20 ${
                            cell.max === null ? 'text-on-surface-variant/30 font-medium' : boldMax ? 'font-bold text-primary text-lg bg-green-100' : 'font-semibold text-on-surface'
                          }`}
                        >
                          {fmt(cell.max)}
                        </td>,
                        <td
                          key={`${row.model}-${v.key}-mean`}
                          className={`text-right font-mono tabular-nums text-base px-3 py-3 ${
                            cell.mean === null ? 'text-on-surface-variant/30 font-medium' : boldMean ? 'font-bold text-primary text-lg bg-green-100' : 'font-semibold text-on-surface'
                          }`}
                        >
                          {fmt(cell.mean)}
                        </td>,
                      ];
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Qwen 3 Models Comparison Table */}
      <section className="bg-surface-container-low rounded-xl p-8">
        <div className="mb-6 max-w-5xl">
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider mb-3">
            Qwen 3 Scaling Comparison
          </h3>
          <p className="text-xs text-on-surface-variant font-body leading-relaxed">
            Comparing the different model sizes of the Qwen 3 family across our key datasets.
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
                {VARIANT_COLUMNS.map((v) => (
                  <th
                    key={v.key}
                    colSpan={2}
                    className="text-center text-[10px] font-bold uppercase tracking-widest text-primary px-4 pt-3 pb-1 border-l border-outline-variant/20"
                  >
                    <div>{v.label}</div>
                    <div className="text-[9px] font-medium normal-case tracking-normal text-on-surface-variant/70 mt-0.5">
                      {v.subtitle}
                    </div>
                  </th>
                ))}
              </tr>
              <tr className="border-b border-outline-variant/30">
                {VARIANT_COLUMNS.flatMap((v) => [
                  <th
                    key={`${v.key}-max`}
                    className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2 border-l border-outline-variant/20"
                  >
                    µ_Max
                  </th>,
                  <th
                    key={`${v.key}-mean`}
                    className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2"
                  >
                    µ_Mean
                  </th>,
                ])}
              </tr>
            </thead>
            <tbody>
              {QWEN3_SCORES.map((row, idx) => {
                return (
                  <tr
                    key={row.model}
                    className={`border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors ${
                      idx === QWEN3_SCORES.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-headline font-semibold text-on-surface">
                        {row.model}
                      </div>
                      {row.note && (
                        <div className="text-[10px] font-body text-on-surface-variant/70 italic mt-0.5">
                          {row.note}
                        </div>
                      )}
                    </td>
                    {VARIANT_COLUMNS.flatMap((v) => {
                      const cell = row.scores[v.key];
                      const mx = ROW_MAXIMA.get(row);
                      const boldMax = cell.max !== null && mx != null && cell.max === mx[v.key].max;
                      const boldMean = cell.mean !== null && mx != null && cell.mean === mx[v.key].mean;
                      return [
                        <td
                          key={`${row.model}-${v.key}-max`}
                          className={`text-right font-mono tabular-nums text-base px-3 py-3 border-l border-outline-variant/20 ${
                            cell.max === null ? 'text-on-surface-variant/30 font-medium' : boldMax ? 'font-bold text-primary text-lg bg-green-100' : 'font-semibold text-on-surface'
                          }`}
                        >
                          {fmt(cell.max)}
                        </td>,
                        <td
                          key={`${row.model}-${v.key}-mean`}
                          className={`text-right font-mono tabular-nums text-base px-3 py-3 ${
                            cell.mean === null ? 'text-on-surface-variant/30 font-medium' : boldMean ? 'font-bold text-primary text-lg bg-green-100' : 'font-semibold text-on-surface'
                          }`}
                        >
                          {fmt(cell.mean)}
                        </td>,
                      ];
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Encoder Models Comparison Table (XLM-RoBERTa large, LaBSE) */}
      <section className="bg-surface-container-low rounded-xl p-8">
        <div className="mb-6 max-w-5xl">
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider mb-3">
            Multilingual Encoder Baselines
          </h3>
          <p className="text-xs text-on-surface-variant font-body leading-relaxed">
            Dedicated multilingual encoders evaluated with the same MEXA pipeline. Unlike the
            English-centric causal LMs above, these are bidirectional encoders — XLM-RoBERTa
            (masked-LM), LaBSE (a sentence-transformer trained for cross-lingual alignment),
            Multilingual E5 (dual-encoder), and mmBERT.
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
                {VARIANT_COLUMNS.map((v) => (
                  <th
                    key={v.key}
                    colSpan={2}
                    className="text-center text-[10px] font-bold uppercase tracking-widest text-primary px-4 pt-3 pb-1 border-l border-outline-variant/20"
                  >
                    <div>{v.label}</div>
                    <div className="text-[9px] font-medium normal-case tracking-normal text-on-surface-variant/70 mt-0.5">
                      {v.subtitle}
                    </div>
                  </th>
                ))}
              </tr>
              <tr className="border-b border-outline-variant/30">
                {VARIANT_COLUMNS.flatMap((v) => [
                  <th
                    key={`${v.key}-max`}
                    className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2 border-l border-outline-variant/20"
                  >
                    µ_Max
                  </th>,
                  <th
                    key={`${v.key}-mean`}
                    className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2"
                  >
                    µ_Mean
                  </th>,
                ])}
              </tr>
            </thead>
            <tbody>
              {ENCODER_SCORES.map((row, idx) => {
                return (
                  <tr
                    key={row.model}
                    className={`border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors ${
                      idx === ENCODER_SCORES.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-headline font-semibold text-on-surface">
                        {row.model}
                      </div>
                      {row.note && (
                        <div className="text-[10px] font-body text-on-surface-variant/70 italic mt-0.5">
                          {row.note}
                        </div>
                      )}
                    </td>
                    {VARIANT_COLUMNS.flatMap((v) => {
                      const cell = row.scores[v.key];
                      const mx = ROW_MAXIMA.get(row);
                      const boldMax = cell.max !== null && mx != null && cell.max === mx[v.key].max;
                      const boldMean = cell.mean !== null && mx != null && cell.mean === mx[v.key].mean;
                      return [
                        <td
                          key={`${row.model}-${v.key}-max`}
                          className={`text-right font-mono tabular-nums text-base px-3 py-3 border-l border-outline-variant/20 ${
                            cell.max === null ? 'text-on-surface-variant/30 font-medium' : boldMax ? 'font-bold text-primary text-lg bg-green-100' : 'font-semibold text-on-surface'
                          }`}
                        >
                          {fmt(cell.max)}
                        </td>,
                        <td
                          key={`${row.model}-${v.key}-mean`}
                          className={`text-right font-mono tabular-nums text-base px-3 py-3 ${
                            cell.mean === null ? 'text-on-surface-variant/30 font-medium' : boldMean ? 'font-bold text-primary text-lg bg-green-100' : 'font-semibold text-on-surface'
                          }`}
                        >
                          {fmt(cell.mean)}
                        </td>,
                      ];
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Causal Embedding Models Comparison Table */}
      <section className="bg-surface-container-low rounded-xl p-8">
        <div className="mb-6 max-w-5xl">
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider mb-3">
            Causal Embedding Models (Qwen3-Embedding)
          </h3>
          <p className="text-xs text-on-surface-variant font-body leading-relaxed">
            Decoder-only causal models adapted specifically for text embedding tasks, evaluated with the same MEXA pipeline.
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
                {VARIANT_COLUMNS.map((v) => (
                  <th
                    key={v.key}
                    colSpan={2}
                    className="text-center text-[10px] font-bold uppercase tracking-widest text-primary px-4 pt-3 pb-1 border-l border-outline-variant/20"
                  >
                    <div>{v.label}</div>
                    <div className="text-[9px] font-medium normal-case tracking-normal text-on-surface-variant/70 mt-0.5">
                      {v.subtitle}
                    </div>
                  </th>
                ))}
              </tr>
              <tr className="border-b border-outline-variant/30">
                {VARIANT_COLUMNS.flatMap((v) => [
                  <th
                    key={`${v.key}-max`}
                    className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2 border-l border-outline-variant/20"
                  >
                    µ_Max
                  </th>,
                  <th
                    key={`${v.key}-mean`}
                    className="text-right text-[10px] font-semibold tracking-wider text-on-surface-variant px-3 py-2"
                  >
                    µ_Mean
                  </th>,
                ])}
              </tr>
            </thead>
            <tbody>
              {EMBEDDING_SCORES.map((row, idx) => {
                return (
                  <tr
                    key={row.model}
                    className={`border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors ${
                      idx === EMBEDDING_SCORES.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-headline font-semibold text-on-surface">
                        {row.model}
                      </div>
                      {row.note && (
                        <div className="text-[10px] font-body text-on-surface-variant/70 italic mt-0.5">
                          {row.note}
                        </div>
                      )}
                    </td>
                    {VARIANT_COLUMNS.flatMap((v) => {
                      const cell = row.scores[v.key];
                      const mx = ROW_MAXIMA.get(row);
                      const boldMax = cell.max !== null && mx != null && cell.max === mx[v.key].max;
                      const boldMean = cell.mean !== null && mx != null && cell.mean === mx[v.key].mean;
                      return [
                        <td
                          key={`${row.model}-${v.key}-max`}
                          className={`text-right font-mono tabular-nums text-base px-3 py-3 border-l border-outline-variant/20 ${
                            cell.max === null ? 'text-on-surface-variant/30 font-medium' : boldMax ? 'font-bold text-primary text-lg bg-green-100' : 'font-semibold text-on-surface'
                          }`}
                        >
                          {fmt(cell.max)}
                        </td>,
                        <td
                          key={`${row.model}-${v.key}-mean`}
                          className={`text-right font-mono tabular-nums text-base px-3 py-3 ${
                            cell.mean === null ? 'text-on-surface-variant/30 font-medium' : boldMean ? 'font-bold text-primary text-lg bg-green-100' : 'font-semibold text-on-surface'
                          }`}
                        >
                          {fmt(cell.mean)}
                        </td>,
                      ];
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* MEXA score vs model size — scaling charts */}
      <div className="grid grid-cols-12 gap-8">
        <ScoreHistogramChart
          title="MEXA Score Distribution — All Models"
          subtitle="Count of models in each score range; select an experiment and toggle bin resolution."
          rows={ALL_MODEL_SIZE_ROWS}
          variants={VARIANT_COLUMNS}
          defaultVariantKey="flores-table1-2000"
          className="col-span-12"
        />
        <ScoreVsSizeChart
          title="MEXA Score vs Model Size — Qwen3 Scaling"
          subtitle="Qwen3 family (0.6B → 9B). The trend line shows how alignment scales with size within one model family."
          rows={QWEN3_SIZE_ROWS}
          variants={VARIANT_COLUMNS}
          defaultVariantKey="flores-table1-2000"
          showTrendLine
          className="col-span-12"
        />
      </div>

      {/* Experiment Timeline */}
      <div className="grid grid-cols-12 gap-8">
        <ExperimentTimeline
          title="Experiment Log"
          entries={EXPERIMENT_ENTRIES}
          maxVisible={5}
          className="col-span-12"
        />
      </div>
    </div>
  );
}
