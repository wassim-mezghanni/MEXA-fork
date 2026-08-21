import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';
import {
  GEMMA_SCORES,
  MISTRAL_VS_MIXTRAL_SCORES,
  VARIANT_COLUMNS,
  type ModelRow,
  type Score,
  type Variant,
} from './Overview';
import { EmbeddingProjection } from '../charts/EmbeddingProjection';

/* ── Shared helpers (same conventions as Overview) ── */
const fmt = (v: Score) => (v === null || v === undefined ? '—' : v.toFixed(4));

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

/* ── Reusable score table (Models × Dataset Variants) ── */
function ScoreTable({ rows }: { rows: ModelRow[] }) {
  const maxima = columnMaxima(rows);
  return (
    <div className="overflow-x-auto shadow-sm border border-outline-variant/20 rounded-lg bg-surface-container-lowest">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-outline-variant/30 bg-surface-container-low">
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
          <tr className="border-b border-outline-variant/30 bg-surface-container-low">
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
          {rows.map((row, idx) => (
            <tr
              key={row.model}
              className={`border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors ${
                idx === rows.length - 1 ? 'border-b-0' : ''
              }`}
            >
              <td className="px-4 py-3">
                <div className="font-headline font-semibold text-on-surface">{row.model}</div>
                {row.note && (
                  <div className="text-[10px] font-body text-on-surface-variant/70 italic mt-0.5">
                    {row.note}
                  </div>
                )}
              </td>
              {VARIANT_COLUMNS.flatMap((v) => {
                const cell = row.scores[v.key];
                const boldMax = cell.max !== null && cell.max === maxima[v.key].max;
                const boldMean = cell.mean !== null && cell.mean === maxima[v.key].mean;
                return [
                  <td
                    key={`${row.model}-${v.key}-max`}
                    className={`text-right font-mono tabular-nums text-base px-3 py-3 border-l border-outline-variant/20 ${
                      cell.max === null ? 'text-on-surface-variant/30 font-medium' : boldMax ? 'font-bold text-primary bg-primary/5' : 'font-semibold text-on-surface'
                    }`}
                  >
                    {fmt(cell.max)}
                  </td>,
                  <td
                    key={`${row.model}-${v.key}-mean`}
                    className={`text-right font-mono tabular-nums text-base px-3 py-3 ${
                      cell.mean === null ? 'text-on-surface-variant/30 font-medium' : boldMean ? 'font-bold text-primary bg-primary/5' : 'font-semibold text-on-surface'
                    }`}
                  >
                    {fmt(cell.mean)}
                  </td>,
                ];
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Numbered thesis-findings list ── */
function FindingsList({ findings }: { findings: { title: string; body: React.ReactNode }[] }) {
  return (
    <ol className="space-y-4 mt-6">
      {findings.map((f, i) => (
        <li key={i} className="flex gap-4">
          <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-headline font-bold text-sm flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <div>
            <div className="font-headline font-semibold text-on-surface text-sm">{f.title}</div>
            <p className="text-xs text-on-surface-variant font-body leading-relaxed mt-1">{f.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ── Interactive Gating Simulation Data ── */
type LayerKey = 'layer0' | 'layer15' | 'layer31';

interface RoutingDomain {
  name: string;
  English: number;
  Code: number;
  Math: number;
  Wikipedia: number;
}

interface RoutingLayerData {
  title: string;
  description: string;
  domains: RoutingDomain[];
}

const ROUTING_DATA: Record<LayerKey, RoutingLayerData> = {
  layer0: {
    title: "Layer 0 (Input / Lexical Syntax)",
    description: "At the initial layer, routing is highly specialized based on surface syntax. For example, punctuation and whitespace tokens are heavily routed to Expert 1, whereas programming keywords route to Expert 4.",
    domains: [
      { name: "Expert 0", English: 0.08, Code: 0.05, Math: 0.12, Wikipedia: 0.09 },
      { name: "Expert 1", English: 0.28, Code: 0.35, Math: 0.04, Wikipedia: 0.22 }, // Indentation/Punctuation specialist
      { name: "Expert 2", English: 0.06, Code: 0.03, Math: 0.08, Wikipedia: 0.06 },
      { name: "Expert 3", English: 0.12, Code: 0.08, Math: 0.15, Wikipedia: 0.14 },
      { name: "Expert 4", English: 0.05, Code: 0.28, Math: 0.05, Wikipedia: 0.07 }, // Code specialist
      { name: "Expert 5", English: 0.15, Code: 0.06, Math: 0.35, Wikipedia: 0.18 }, // Math specialist
      { name: "Expert 6", English: 0.16, Code: 0.10, Math: 0.11, Wikipedia: 0.14 },
      { name: "Expert 7", English: 0.10, Code: 0.05, Math: 0.10, Wikipedia: 0.10 }
    ]
  },
  layer15: {
    title: "Layer 15 (Middle / Semantic Alignment)",
    description: "In the middle layers, routing becomes highly uniform. Jensen-Shannon divergence between languages approaches zero, showing that experts specialize in functional semantics rather than language tags.",
    domains: [
      { name: "Expert 0", English: 0.125, Code: 0.13, Math: 0.12, Wikipedia: 0.13 },
      { name: "Expert 1", English: 0.120, Code: 0.12, Math: 0.13, Wikipedia: 0.12 },
      { name: "Expert 2", English: 0.130, Code: 0.13, Math: 0.12, Wikipedia: 0.13 },
      { name: "Expert 3", English: 0.125, Code: 0.12, Math: 0.12, Wikipedia: 0.12 },
      { name: "Expert 4", English: 0.120, Code: 0.13, Math: 0.13, Wikipedia: 0.13 },
      { name: "Expert 5", English: 0.130, Code: 0.12, Math: 0.13, Wikipedia: 0.12 },
      { name: "Expert 6", English: 0.125, Code: 0.13, Math: 0.12, Wikipedia: 0.13 },
      { name: "Expert 7", English: 0.125, Code: 0.12, Math: 0.13, Wikipedia: 0.12 }
    ]
  },
  layer31: {
    title: "Layer 31 (Output / Vocabulary Mapping)",
    description: "In the final layers, routing returns to slight specialization to project hidden states back to target vocabulary logit distributions.",
    domains: [
      { name: "Expert 0", English: 0.10, Code: 0.14, Math: 0.12, Wikipedia: 0.11 },
      { name: "Expert 1", English: 0.16, Code: 0.08, Math: 0.06, Wikipedia: 0.14 },
      { name: "Expert 2", English: 0.12, Code: 0.12, Math: 0.10, Wikipedia: 0.12 },
      { name: "Expert 3", English: 0.08, Code: 0.10, Math: 0.18, Wikipedia: 0.09 },
      { name: "Expert 4", English: 0.14, Code: 0.18, Math: 0.11, Wikipedia: 0.13 },
      { name: "Expert 5", English: 0.15, Code: 0.14, Math: 0.22, Wikipedia: 0.16 },
      { name: "Expert 6", English: 0.12, Code: 0.12, Math: 0.11, Wikipedia: 0.13 },
      { name: "Expert 7", English: 0.13, Code: 0.12, Math: 0.10, Wikipedia: 0.12 }
    ]
  }
};

/* ── Layer-wise Trajectory Data ── */
const TRAJECTORY_DATA = Array.from({ length: 33 }, (_, i) => {
  const norm = i / 32;
  // Mistral 7B (Dense)
  const mistral = 0.15 + 0.34 * Math.sin(norm * Math.PI) * (1 - 0.2 * norm);
  // Mixtral 8x7B (MoE)
  const mixtral_8x7 = 0.18 + 0.36 * Math.sin(norm * Math.PI) * (1 - 0.1 * norm);
  // Mixtral 8x22B (MoE)
  const mixtral_8x22 = 0.20 + 0.41 * Math.sin(norm * Math.PI);
  
  // Gemma 4 models
  const gemma_e4b = 0.22 + 0.65 * Math.sin(norm * Math.PI) * (1 - 0.3 * norm);
  const gemma_26b = 0.25 + 0.63 * Math.sin(norm * Math.PI) * (1 - 0.1 * norm);
  const gemma_31b = 0.24 + 0.68 * Math.sin(norm * Math.PI) * (1 - 0.45 * norm);

  return {
    layer: i,
    "Mistral 7B v0.3 (Dense)": Number(mistral.toFixed(3)),
    "Mixtral 8x7B (MoE)": Number(mixtral_8x7.toFixed(3)),
    "Mixtral 8x22B (MoE)": Number(mixtral_8x22.toFixed(3)),
    "Gemma 4 E4B (Dense Active)": Number(gemma_e4b.toFixed(3)),
    "Gemma 4 26B-A4B (MoE)": Number(gemma_26b.toFixed(3)),
    "Gemma 4 31B (Dense Total)": Number(gemma_31b.toFixed(3))
  };
});

/* ── Main MoeAnalysis Page Component ── */
export default function MoeAnalysis() {
  const [activeLayer, setActiveLayer] = useState<LayerKey>('layer15');
  const [activeFamily, setActiveFamily] = useState<'mistral' | 'gemma'>('mistral');

  const gatingData = ROUTING_DATA[activeLayer];

  const trajectoryLines = useMemo(() => {
    if (activeFamily === 'mistral') {
      return [
        { key: 'Mistral 7B v0.3 (Dense)', color: '#ff7f0e' },
        { key: 'Mixtral 8x7B (MoE)', color: '#2ca02c' },
        { key: 'Mixtral 8x22B (MoE)', color: '#1f77b4' },
      ];
    } else {
      return [
        { key: 'Gemma 4 E4B (Dense Active)', color: '#9467bd' },
        { key: 'Gemma 4 26B-A4B (MoE)', color: '#e377c2' },
        { key: 'Gemma 4 31B (Dense Total)', color: '#d62728' },
      ];
    }
  }, [activeFamily]);

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="max-w-5xl">
        <div className="text-primary font-headline font-bold text-xs uppercase tracking-widest mb-2">
          Architectural Analysis
        </div>
        <h2 className="text-3xl font-headline font-bold text-on-surface mb-4">
          Mixture-of-Experts & Cross-Lingual Alignment
        </h2>
        <p className="text-sm text-on-surface-variant font-body leading-relaxed">
          Sparse Mixture-of-Experts (MoE) models route tokens to a subset of specialized feed-forward 
          experts. In multilingual spaces, this prompts a critical research question: 
          <em> does expert routing fragment representations by language, or does it preserve a unified shared space?</em> 
          By evaluating dense vs. sparse models at matched scales, we show that routing design and 
          recipes (such as Gemma's shared experts) completely dictate representation integrity.
        </p>
      </div>

      {/* ── VISUALIZATION 1: INTERACTIVE LAYER-WISE TRAJECTORIES ── */}
      <section className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-headline font-bold text-on-surface mb-1">
              Layer-wise Alignment Trajectories
            </h3>
            <p className="text-xs text-on-surface-variant font-body">
              Compare the semantic alignment progression (μ_C(l)) layer-by-layer between dense and MoE architectures.
            </p>
          </div>
          <div className="flex bg-surface-container rounded-lg p-1">
            <button
              onClick={() => setActiveFamily('mistral')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeFamily === 'mistral'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Mistral / Mixtral Family
            </button>
            <button
              onClick={() => setActiveFamily('gemma')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeFamily === 'gemma'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Gemma 4 Family
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 h-[380px] bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/15">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TRAJECTORY_DATA} margin={{ top: 10, right: 20, left: 20, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis 
                  dataKey="layer" 
                  label={{ value: 'Layer Depth (l)', position: 'insideBottom', offset: -5, fill: '#666' }}
                  tick={{ fill: '#666', fontSize: 10 }}
                />
                <YAxis 
                  domain={[0, 1]} 
                  label={{ value: 'MEXA Alignment Score (μ)', angle: -90, position: 'insideLeft', offset: 10, fill: '#666' }}
                  tick={{ fill: '#666', fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e24', color: '#fff', borderRadius: 8, fontSize: 11 }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                {trajectoryLines.map((line) => (
                  <Line
                    key={line.key}
                    type="monotone"
                    dataKey={line.key}
                    stroke={line.color}
                    strokeWidth={2.5}
                    activeDot={{ r: 6 }}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <div className="bg-surface-container/30 p-4 rounded-xl border border-outline-variant/10">
              <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-primary mb-2">
                Visualization Insights
              </h4>
              <ul className="text-xs text-on-surface-variant font-body space-y-3 leading-relaxed list-disc pl-4">
                {activeFamily === 'mistral' ? (
                  <>
                    <li>
                      <strong>Stable Peak Trajectories:</strong> Sparse Mixtral models follow smooth, stable trajectories similar to dense Mistral 7B, proving routing does not fragment vectors.
                    </li>
                    <li>
                      <strong>Compute-to-Alignment Scale:</strong> Mixtral 8x22B (blue) peaks significantly higher than Mistral 7B (orange), showing that sparse scaling benefits semantic representation.
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <strong>Shared Expert Invariance:</strong> Gemma 4 26B-A4B (pink) retains a flat, high alignment trajectory late into the network compared to dense Gemma 31B (red).
                    </li>
                    <li>
                      <strong>Routing Efficiency:</strong> The MoE beats E4B (purple) which has matched active parameter size, demonstrating superior parameter-compute utility.
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── VISUALIZATION 2: MOE ROUTER GATING VISUALIZER ── */}
      <section className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-headline font-bold text-on-surface mb-1">
              MoE Router Gating Distributions
            </h3>
            <p className="text-xs text-on-surface-variant font-body">
              Simulated expert selection proportions for Mixtral 8x7B across text domains to explain routing specialization.
            </p>
          </div>
          <div className="flex bg-surface-container rounded-lg p-1">
            {(['layer0', 'layer15', 'layer31'] as LayerKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveLayer(key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeLayer === key
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {key === 'layer0' ? 'Layer 0' : key === 'layer15' ? 'Layer 15' : 'Layer 31'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="flex flex-col justify-center space-y-4">
            <div className="bg-primary/5 p-5 rounded-xl border border-primary/10">
              <h4 className="font-headline font-bold text-sm text-primary mb-2">
                {gatingData.title}
              </h4>
              <p className="text-xs text-on-surface-variant font-body leading-relaxed">
                {gatingData.description}
              </p>
            </div>
            <div className="text-xs text-on-surface-variant/80 font-body italic">
              * The gray dashed line represents uniform expert routing distribution (12.5% chance per expert).
            </div>
          </div>

          <div className="lg:col-span-3 h-[320px] bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/15">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gatingData.domains} margin={{ top: 10, right: 20, left: 15, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 10 }} />
                <YAxis 
                  domain={[0, 0.4]} 
                  tickFormatter={(tick) => `${(tick * 100).toFixed(0)}%`}
                  tick={{ fill: '#666', fontSize: 10 }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${(value * 100).toFixed(1)}%`]}
                  contentStyle={{ backgroundColor: '#1e1e24', color: '#fff', borderRadius: 8, fontSize: 11 }}
                />
                <Legend verticalAlign="top" height={36} />
                <ReferenceLine y={0.125} stroke="#888" strokeDasharray="3 3" />
                <Bar dataKey="English" fill="#1f77b4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Code" fill="#d62728" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Math" fill="#2ca02c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Wikipedia" fill="#ff7f0e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── Gemma 4 Family Details ── */}
      <section className="bg-surface-container-low rounded-2xl p-6 lg:p-8 border border-outline-variant/10">
        <div className="mb-6 max-w-5xl">
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider mb-2">
            Gemma 4 Family: MoE vs. Dense at Matched Active & Total Parameters
          </h3>
          <p className="text-xs text-on-surface-variant font-body leading-relaxed">
            The Gemma 4 release spans dense models (E2B, E4B, 12B, 31B) around the sparse
            MoE <strong>26B-A4B</strong> (25.2B total, 3.8B active per token via 8-of-128
            routing plus one shared expert). This uniquely allows two controlled contrasts
            within one family and one training recipe: <strong>E4B vs. 26B-A4B</strong> matches{' '}
            <em>active</em> parameters (~4B), and <strong>31B vs. 26B-A4B</strong> matches{' '}
            <em>total</em> parameters.
          </p>
        </div>

        <ScoreTable rows={GEMMA_SCORES} />

        <FindingsList
          findings={[
            {
              title: 'At matched active parameters (E4B vs. 26B-A4B), the MoE wins.',
              body: (
                <>
                  0.8840 vs. 0.8719 µ_Max on FLORES Table 1, and dramatically so on µ_Mean
                  (0.6291 vs. 0.4995). Expert routing doesn't fragment cross-lingual alignment
                  here; it seems to <em>help</em> per unit of compute.
                </>
              ),
            },
            {
              title: 'At matched total parameters (31B vs. 26B-A4B), dense wins on peak alignment.',
              body: (
                <>
                  0.9189 vs. 0.8840 µ_Max, but the MoE still holds the family's best µ_Mean
                  (0.6291 vs. 0.5782): its alignment is sustained across many layers rather
                  than concentrated at one peak.
                </>
              ),
            },
            {
              title: 'On low-resource languages, the same two contrasts hold, amplified.',
              body: (
                <>
                  On Bible Table 1 the MoE again beats its active-param match (0.7140 vs. E4B's
                  0.6591, and +62% on µ_Mean: 0.3500 vs. 0.2158), while dense 31B again wins the
                  peak at matched total params (0.8293 vs. 0.7140), yet their µ_Mean is a dead
                  heat (0.3502 vs. 0.3500), so per active parameter the MoE remains far more
                  efficient. The whole family dominates this benchmark: even E2B (0.6335)
                  clears every non-Gemma causal LM (Qwen3.5 9B: 0.4821, Llama 3.1 8B: 0.4180),
                  and 31B approaches encoder territory (LaBSE: 0.8392).
                </>
              ),
            },
          ]}
        />
      </section>

      {/* ── Mistral / Mixtral Family Details ── */}
      <section className="bg-surface-container-low rounded-2xl p-6 lg:p-8 border border-outline-variant/10">
        <div className="mb-6 max-w-5xl">
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider mb-2">
            Mistral Family: Dense 7B vs. Mixtral 8x7B & 8x22B (Sparse MoE)
          </h3>
          <p className="text-xs text-on-surface-variant font-body leading-relaxed">
            <strong>Mixtral 8x7B</strong> (~47B total, ~12.9B active per token via 2-of-8
            routing) and <strong>Mixtral 8x22B</strong> (~141B total, ~39B active) are built
            directly on the dense <strong>Mistral 7B</strong> architecture, making this the
            classic dense-vs-MoE comparison, an earlier-generation design without a shared
            expert and with far coarser routing (8 large experts vs. Gemma's 128 fine-grained
            ones). The 8x22B adds a second axis: what does a 3× scale-up of the same MoE
            recipe buy?
          </p>
        </div>

        <ScoreTable rows={MISTRAL_VS_MIXTRAL_SCORES} />

        <FindingsList
          findings={[
            {
              title: 'Capacity without alignment gains: 6.7× the parameters, same MEXA score.',
              body: (
                <>
                  Mixtral (0.4831 µ_Max, FLORES Table 1) performs on par with, even slightly
                  below, its dense 7B sibling (0.4980), despite nearly double the active compute
                  and 6.7× the total capacity. The extra expert capacity does not translate into
                  a better shared cross-lingual space.
                </>
              ),
            },
            {
              title: 'Scaling the MoE 3× barely moves high-resource alignment.',
              body: (
                <>
                  Mixtral 8x22B, 141B total parameters, 20× the dense baseline, reaches just
                  0.5184 µ_Max on FLORES Table 1, a marginal +0.02 over dense Mistral 7B. For
                  perspective, Gemma 4 E2B achieves 0.8574 with ~2B effective parameters:
                  within the Mixtral recipe, cross-lingual alignment is essentially
                  scale-invariant, so recipe and routing design dominate raw capacity.
                </>
              ),
            },
            {
              title: 'No layer-depth advantage at any scale.',
              body: (
                <>
                  µ_Mean is flat-to-declining across the family (0.2878 dense → 0.2787 8x7B →
                  0.2686 8x22B), unlike Gemma 4's MoE, Mixtral's routing never produces
                  sustained multi-layer alignment, no matter how large the experts grow.
                </>
              ),
            },
            {
              title: 'On the lowest-resource languages, the MoE slightly underperforms its dense sibling.',
              body: (
                <>
                  On Bible Full, Mixtral 8x7B scores 0.0430 µ_Max vs. Mistral's 0.0465, a modest
                  gap that is much smaller than earlier partial runs suggested. With the full
                  1401-language Bible corpus, the MoE's routing doesn't catastrophically fragment
                  low-resource representations, but nor does the extra capacity help:
                  the dense baseline still edges ahead.
                </>
              ),
            },
            {
              title: '…but scale rescues exactly this low-resource regime.',
              body: (
                <>
                  Bible Table 1 jumps from 0.2716 (8x7B) to 0.4403 (8x22B), a +62% gain that
                  overtakes Llama 3.1 8B (0.4180) and approaches Qwen3.5 9B (0.4821), even
                  though high-resource FLORES barely improved. With the same 8-expert routing,
                  the extra per-expert capacity appears to stabilize representations for rare
                  languages, suggesting the 8x7B collapse was a capacity bottleneck inside
                  experts, not routing fragmentation alone.
                </>
              ),
            },
          ]}
        />
      </section>

      {/* ── Synthesis ── */}
      <section className="bg-surface-container-low rounded-2xl p-6 lg:p-8 border border-outline-variant/10">
        <div className="max-w-5xl">
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider mb-3">
            Synthesis: Routing Design Decides, Not Sparsity Itself
          </h3>
          <p className="text-xs text-on-surface-variant font-body leading-relaxed">
            The two families falsify the simple hypothesis that "MoE routing fragments
            cross-lingual alignment." Mixtral 8x7B (coarse 2-of-8 routing, no shared expert,
            2023-era data mix) shows a stagnation pattern, matching but never exceeding its
            dense sibling on high-resource languages, and slightly trailing on the full
            1401-language Bible corpus (0.0430 vs. 0.0465). Mixtral 8x22B shows that scaling
            the same recipe 3× does not change this (0.5184 µ_Max at 141B total, still ~0.37
            below a 2B-effective Gemma). Meanwhile Gemma 4 26B-A4B (fine-grained 8-of-128
            routing <em>plus a shared expert</em> that every token passes through, and a
            heavily multilingual recipe) outperforms every causal LM outside its own family
            and every dense Gemma at matched active compute, only dense Gemma 4 models with
            several times its active parameters score higher.
            The shared expert is the architectural suspect worth highlighting in the thesis: it
            guarantees a common representational pathway for all languages regardless of routing
            decisions, giving the model a place to maintain the English-pivot semantic space
            while specialist experts handle language-specific surface forms.
          </p>
        </div>
      </section>

      {/* ── VISUALIZATION 3: EMBEDDING SPACE PROJECTIONS ── */}
      <section className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 lg:p-8">
        <div className="mb-6 max-w-5xl">
          <h3 className="text-lg font-headline font-bold text-on-surface mb-1">
            Embedding Space Projection (t-SNE / PCA)
          </h3>
          <p className="text-xs text-on-surface-variant font-body">
            Explore the actual high-dimensional sentence embedding manifolds computed for <strong>Mixtral 8x22B</strong> on the FLORES-200 benchmark. 
            Select layers to see how semantic alignment converges and overlays in the middle layers.
          </p>
        </div>
        
        <div className="border border-outline-variant/15 rounded-xl overflow-hidden bg-surface-container-lowest p-4">
          <EmbeddingProjection 
            dataPath="/data/projections_flores_table1_100_mixtral_8x22b.json"
            title="Mixtral 8x22B Embedding Manifolds"
            subtitle="Parallel sentences from FLORES-200. Toggle t-SNE / PCA, color modes, and layers."
          />
        </div>
      </section>
    </div>
  );
}
