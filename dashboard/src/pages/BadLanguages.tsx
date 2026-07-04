import { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import Heatmap from '../components/Heatmap';
import FertilityScatter from '../components/FertilityScatter';
import { DataTable, type ColumnDef } from '../charts/DataTable';
import { getScriptName } from '../utils/scriptNames';

/* ── Types ── */
interface LangRow {
  code: string;
  name: string;
  script: string;
  avg: number;
  min: number;
  max: number;
  std: number;
  num_models: number;
  n_above_0_5: number;
  best_model: string;
  worst_model: string;
  scores: Record<string, number>;
}
interface Difficulty {
  dataset: string;
  num_models: number;
  models: string[];
  languages: LangRow[];
}

type Dataset = 'flores' | 'bible';

/* "Universally hard" vs "model-specific" classification by spread (max-min). */
const HARD_AVG = 0.3;      // below this avg = a hard language
const SPREAD_SPLIT = 0.25; // spread above this = at least one model handles it

function classify(avg: number, spread: number): 'universal' | 'fixable' | 'ok' {
  if (avg >= HARD_AVG) return 'ok';
  return spread >= SPREAD_SPLIT ? 'fixable' : 'universal';
}
const CLASS_COLOR: Record<string, string> = {
  universal: '#dc2626', // red — hard for everyone
  fixable: '#d97706',   // amber — some model already cracks it
  ok: '#94a3b8',        // grey — not in the bad set
};

export default function BadLanguages() {
  const [dataset, setDataset] = useState<Dataset>('flores');
  const [data, setData] = useState<Record<Dataset, Difficulty | null>>({ flores: null, bible: null });
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch('/data/language_difficulty_flores.json').then((r) => r.json()),
      fetch('/data/language_difficulty_bible.json').then((r) => r.json()),
      fetch('/data/language_names.json').then((r) => r.json()),
    ]).then(([flores, bible, ln]) => {
      setData({ flores, bible });
      setNames(ln);
    });
  }, []);

  const active = data[dataset];
  const langs = active?.languages ?? [];

  /* KPI roll-ups */
  const kpis = useMemo(() => {
    if (!langs.length) return null;
    const total = langs.length;
    const failed01 = langs.filter((l) => l.avg < 0.1).length;
    const universal = langs.filter((l) => classify(l.avg, l.max - l.min) === 'universal').length;
    const fixable = langs.filter((l) => classify(l.avg, l.max - l.min) === 'fixable').length;
    // worst script (avg over languages within script, min 3 langs)
    const byScript: Record<string, number[]> = {};
    langs.forEach((l) => (byScript[l.script] ||= []).push(l.avg));
    const worstScript = Object.entries(byScript)
      .filter(([, v]) => v.length >= 3)
      .map(([s, v]) => ({ s, m: v.reduce((a, b) => a + b, 0) / v.length, n: v.length }))
      .sort((a, b) => a.m - b.m)[0];
    return { total, failed01, universal, fixable, worstScript };
  }, [langs]);

  /* Quadrant scatter points */
  const scatter = useMemo(
    () =>
      langs.map((l) => {
        const spread = +(l.max - l.min).toFixed(4);
        return { ...l, spread, cls: classify(l.avg, spread) };
      }),
    [langs],
  );

  /* Heatmap data: worst languages × per-model scores (flatten scores into row) */
  const heatmapData = useMemo(
    () => langs.map((l) => ({ code: l.code, ...l.scores })),
    [langs],
  );

  /* Leaderboard columns */
  const columns: ColumnDef<LangRow>[] = useMemo(
    () => [
      { key: 'name', label: 'Language', sortable: true, render: (_v, r) => (
        <div className="flex flex-col">
          <span className="font-semibold text-on-surface">{r.name}</span>
          <span className="text-[10px] font-mono text-on-surface-variant">{r.code}</span>
        </div>
      ) },
      { key: 'script', label: 'Script', sortable: true, render: (v) => getScriptName(v as string) },
      { key: 'avg', label: 'Mean', align: 'right', sortable: true,
        render: (v) => <span className="font-mono font-semibold">{(v as number).toFixed(3)}</span> },
      { key: 'min', label: 'Min', align: 'right', sortable: true, render: (v) => <span className="font-mono">{(v as number).toFixed(3)}</span> },
      { key: 'max', label: 'Max', align: 'right', sortable: true, render: (v) => <span className="font-mono">{(v as number).toFixed(3)}</span> },
      { key: 'spread', label: 'Spread', align: 'right', sortable: true,
        render: (_v, r) => <span className="font-mono text-amber-700">{(r.max - r.min).toFixed(3)}</span>,
        csvValue: (_v, r) => (r.max - r.min).toFixed(4) },
      { key: 'n_above_0_5', label: '# ≥0.5', align: 'right', sortable: true,
        render: (v, r) => <span className="font-mono">{v as number}<span className="text-on-surface-variant">/{r.num_models}</span></span> },
      { key: 'best_model', label: 'Best model', sortable: true,
        render: (v) => <span className="text-xs text-primary font-medium">{v as string}</span> },
    ],
    [],
  );

  const QuadTooltip = ({ active: a, payload }: any) => {
    if (!a || !payload?.length) return null;
    const d = payload[0].payload as LangRow & { spread: number };
    return (
      <div className="bg-primary text-on-primary py-3 px-4 rounded-lg shadow-xl text-xs">
        <p className="font-headline font-bold text-sm border-b border-on-primary/10 pb-1.5 mb-2">{d.name} <span className="opacity-60 font-mono">{d.code}</span></p>
        <p className="flex justify-between gap-6">Mean alignment: <strong className="font-mono">{d.avg.toFixed(3)}</strong></p>
        <p className="flex justify-between gap-6">Spread (max−min): <strong className="font-mono">{d.spread.toFixed(3)}</strong></p>
        <p className="flex justify-between gap-6">Best: <strong className="font-mono text-emerald-300">{d.best_model}</strong></p>
        <p className="flex justify-between gap-6">Worst: <strong className="font-mono text-red-300">{d.worst_model}</strong></p>
      </div>
    );
  };

  if (!active) {
    return (
      <div className="p-12 text-sm text-on-surface-variant font-label">Loading cross-model language difficulty data…</div>
    );
  }

  return (
    <div className="px-12 py-10 max-w-[1600px] mx-auto">
      {/* Header + dataset toggle */}
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">Bad Languages Analysis</h1>
          <p className="text-sm text-on-surface-variant font-body mt-2 max-w-3xl">
            Which languages does cross-lingual alignment fail on — and is the failure <em>universal</em> (no model
            handles it, a genuinely hard language) or <em>model-specific</em> (some model already cracks it, so it is
            fixable)? Aggregated over all {active.num_models} models &amp; experiments. Score = MEXA max-pool alignment
            to the English pivot.
          </p>
        </div>
        <div className="flex gap-1 bg-surface-container-lowest p-1 rounded-lg shrink-0">
          {(['flores', 'bible'] as Dataset[]).map((d) => (
            <button
              key={d}
              onClick={() => setDataset(d)}
              className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${dataset === d ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-primary'}`}
            >
              {d === 'flores' ? 'FLORES-200' : 'Bible (sPBC)'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Languages analysed', value: kpis.total, sub: `${active.num_models} models` },
            { label: 'Near-zero (mean < 0.1)', value: kpis.failed01, sub: `${((kpis.failed01 / kpis.total) * 100).toFixed(0)}% of languages`, accent: 'text-red-600' },
            { label: 'Universally hard', value: kpis.universal, sub: 'no model handles them', accent: 'text-red-600' },
            { label: 'Fixable (model-specific)', value: kpis.fixable, sub: 'some model succeeds', accent: 'text-amber-600' },
          ].map((k) => (
            <div key={k.label} className="bg-surface-container-low rounded-xl p-5">
              <p className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">{k.label}</p>
              <p className={`text-3xl font-headline font-bold mt-1 ${k.accent ?? 'text-primary'}`}>{k.value}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quadrant scatter */}
      <div className="bg-surface-container-low rounded-xl p-8 mb-8">
        <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider">Universally Hard vs. Model-Specific Failures</h3>
        <p className="text-xs text-on-surface-variant font-body mt-1 max-w-3xl mb-4">
          Each point is a language. <strong>X</strong> = mean alignment across models (how bad on average).
          <strong> Y</strong> = spread, best model − worst model (how much models disagree). Bottom-left (red) =
          hard for everyone; bottom-right / high-spread (amber) = at least one model already handles it. Hover for the
          best and worst model on each language.
        </p>
        <div className="flex gap-4 mb-2 text-[11px] font-medium">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: CLASS_COLOR.universal }} />Universally hard</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: CLASS_COLOR.fixable }} />Fixable / model-specific</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: CLASS_COLOR.ok }} />Acceptable</span>
        </div>
        <div className="h-[460px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid stroke="rgba(113,121,113,0.12)" />
              <XAxis type="number" dataKey="avg" domain={[0, 1]} name="Mean alignment"
                tick={{ fill: '#717971', fontSize: 10 }} tickLine={false} axisLine={false}
                label={{ value: 'Mean alignment across models →', position: 'insideBottom', offset: -10, fill: '#717971', fontSize: 11, fontWeight: 600 }} />
              <YAxis type="number" dataKey="spread" domain={[0, 1]} name="Spread (max−min)"
                tick={{ fill: '#717971', fontSize: 10 }} tickLine={false} axisLine={false}
                label={{ value: 'Model disagreement (spread) →', angle: -90, position: 'insideLeft', fill: '#717971', fontSize: 11, fontWeight: 600 }} />
              <ZAxis range={[28, 28]} />
              <ReferenceLine x={HARD_AVG} stroke="#dc2626" strokeDasharray="4 4" strokeOpacity={0.5} />
              <ReferenceLine y={SPREAD_SPLIT} stroke="#d97706" strokeDasharray="4 4" strokeOpacity={0.5} />
              <Tooltip content={<QuadTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatter} fillOpacity={0.7}>
                {scatter.map((p, i) => <Cell key={i} fill={CLASS_COLOR[p.cls]} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model × language failure heatmap */}
      <div className="mb-8">
        <Heatmap data={heatmapData as any} languageNames={names} models={active.models} />
        <p className="text-xs text-on-surface-variant font-body mt-2 px-2">
          Worst languages × every model (sorted worst-first). Vertical dark stripes = a model weak across the board;
          horizontal dark stripes = a language no model aligns. Search and adjust the row count inside the panel.
        </p>
      </div>

      {/* Leaderboard table */}
      <div className="mb-8">
        <DataTable<LangRow>
          title="Worst-aligned languages — leaderboard"
          subtitle={`All ${langs.length} languages, sorted by mean alignment (worst first). 'Spread' and '# ≥0.5' reveal whether any model succeeds.`}
          columns={columns}
          data={langs}
          rowsPerPage={20}
          enableSearch
          searchPlaceholder="Search language or code…"
          enableSorting
          enableExport
          exportFilename={`bad_languages_${dataset}`}
        />
      </div>

      {/* Mechanism: tokenizer fertility */}
      <div className="bg-surface-container-low rounded-xl p-8">
        <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider mb-1">Why They Fail: Tokenizer Fertility</h3>
        <p className="text-xs text-on-surface-variant font-body mb-4 max-w-3xl">
          The mechanism behind low alignment: minority scripts are shattered into far more sub-word tokens (high
          fertility), so the sentence embedding never aligns to the English pivot. Bad languages cluster at high
          fertility / low alignment.
        </p>
        <FertilityScatter />
      </div>
    </div>
  );
}
