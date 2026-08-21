import { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine, ReferenceArea, LabelList,
} from 'recharts';
import { DataTable } from '../charts/DataTable';

const MODELS = [
  { key: 'llama3.1_8b', label: 'Llama 3.1 8B' },
  { key: 'mistral_7b_v03', label: 'Mistral 7B v0.3' },
  { key: 'qwen3.5_9b', label: 'Qwen 3.5 9B Base' },
  { key: 'qwen3_8b', label: 'Qwen 3 8B Base' },
  { key: 'qwen3_4b', label: 'Qwen 3 4B' },
];

const PIVOTS = [
  { code: 'eng_Latn', key: 'eng', label: 'English', color: '#3b82f6' },
  { code: 'arb_Arab', key: 'arb', label: 'Arabic', color: '#f59e0b' },
  { code: 'deu_Latn', key: 'deu', label: 'German', color: '#10b981' },
  { code: 'fra_Latn', key: 'fra', label: 'French', color: '#8b5cf6' },
  { code: 'eus_Latn', key: 'eus', label: 'Basque', color: '#f43f5e' },
  { code: 'zho_Hans', key: 'zho', label: 'Chinese', color: '#0891b2' },
];

interface PivotEntry {
  bestLayer: number;
  mexa: number;
  margin: number;
  diag: number;
  maxOff: number;
  marginByLayer: number[];
  mexaByLayer: number[];
}

interface MarginData {
  model: string;
  pivots: string[];
  layerKeys: number[];
  geometryLayer: number;
  geometry: Record<string, { withinSim: number; baselineSim: number }>;
  languages: Record<string, Record<string, PivotEntry>>;
}

export default function MarginAnalysis() {
  const [selectedModel, setSelectedModel] = useState<string>(MODELS[0].key);
  const [altPivot, setAltPivot] = useState<string>('arb_Arab');
  const [selectedLang, setSelectedLang] = useState<string>('mri_Latn');
  const [data, setData] = useState<MarginData | null>(null);
  const [loading, setLoading] = useState(true);
  const [languageNames, setLanguageNames] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/data/language_names.json')
      .then((r) => r.json())
      .then(setLanguageNames)
      .catch((err) => console.error('Failed to load language names:', err));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/data/margins_flores_table1_100_${selectedModel}.json`)
      .then((r) => r.json())
      .then((d: MarginData) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load margin data:', err);
        setLoading(false);
      });
  }, [selectedModel]);

  const langName = (code: string) => {
    const iso = code.split('_')[0];
    return languageNames[iso] || code;
  };

  const altConf = PIVOTS.find((p) => p.code === altPivot)!;

  // Scatter: English margin (x) vs alternative pivot margin (y), one point per language
  const scatterData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.languages)
      .filter(([code, entry]) => code !== 'eng_Latn' && code !== altPivot && entry['eng_Latn'] && entry[altPivot])
      .map(([code, entry]) => ({
        code,
        name: langName(code),
        x: entry['eng_Latn'].margin,
        y: entry[altPivot].margin,
        engMexa: entry['eng_Latn'].mexa,
        altMexa: entry[altPivot].mexa,
      }));
  }, [data, altPivot, languageNames]);

  const scatterDomain = useMemo(() => {
    if (!scatterData.length) return [-0.05, 0.2];
    const vals = scatterData.flatMap((d) => [d.x, d.y]);
    return [Math.min(...vals) - 0.015, Math.max(...vals) + 0.015];
  }, [scatterData]);

  // Languages the alternative pivot "flips" from fail to pass on average margin
  const flipped = useMemo(
    () => scatterData.filter((d) => d.x <= 0 && d.y > 0),
    [scatterData]
  );

  // Margin across layers for the selected language, one series per pivot
  const layerData = useMemo(() => {
    if (!data) return [];
    const entry = data.languages[selectedLang];
    if (!entry) return [];
    return data.layerKeys.map((layer, i) => {
      const row: Record<string, number> = { layer };
      PIVOTS.forEach((p) => {
        row[p.key] = entry[p.code]?.marginByLayer[i] ?? 0;
      });
      return row;
    });
  }, [data, selectedLang]);

  const availableLangs = useMemo(() => {
    if (!data) return [];
    return Object.keys(data.languages)
      .map((code) => ({ code, name: langName(code) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data, languageNames]);

  // End-of-line direct labels (4 series: labels are mandatory, not a courtesy)
  const endLabel = (pivotKey: string, color: string) => (props: any) => {
    const { x, y, index } = props;
    if (index !== layerData.length - 1) return null;
    return (
      <text x={x + 6} y={y + 3} fontSize={10} fontWeight={700} fill={color}>
        {pivotKey}
      </text>
    );
  };

  const ScatterTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-surface-container-highest/95 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-xl text-xs font-body">
        <p className="font-headline font-bold text-primary mb-1">{d.name} <span className="font-mono text-[10px] opacity-60">{d.code}</span></p>
        <p>English margin: <span className="font-mono font-bold">{d.x >= 0 ? '+' : ''}{d.x.toFixed(3)}</span> · MEXA {d.engMexa.toFixed(2)}</p>
        <p>{altConf.label} margin: <span className="font-mono font-bold">{d.y >= 0 ? '+' : ''}{d.y.toFixed(3)}</span> · MEXA {d.altMexa.toFixed(2)}</p>
      </div>
    );
  };

  const LayerTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-surface-container-highest/95 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-xl text-xs font-body">
        <p className="font-headline font-bold text-primary mb-1">Layer {label}</p>
        {payload.map((p: any, i: number) => {
          const conf = PIVOTS.find((pv) => pv.key === p.dataKey);
          return (
            <p key={i} className="flex justify-between gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: conf?.color }} />
                {conf?.label}
              </span>
              <span className="font-mono font-bold">{p.value >= 0 ? '+' : ''}{p.value.toFixed(3)}</span>
            </p>
          );
        })}
      </div>
    );
  };

  const tableColumns = useMemo(() => {
    const marginCell = (color: string) => (val: any, row: any, colKey: string) => (
      <span className="text-xs font-mono">
        <span className="font-bold" style={{ color }}>{val >= 0 ? '+' : ''}{(val ?? 0).toFixed(3)}</span>
        <span className="text-on-surface-variant opacity-70"> · {(row[colKey + 'Mexa'] ?? 0).toFixed(2)}</span>
      </span>
    );
    return [
      {
        key: 'name', label: 'Language', sortable: true,
        render: (val: any, row: any) => (
          <div>
            <span className="font-headline font-bold text-sm text-on-surface">{val}</span>
            <span className="block font-mono text-[10px] text-on-surface-variant">{row.code}</span>
          </div>
        ),
      },
      ...PIVOTS.map((p) => ({
        key: p.key, label: p.label, align: 'center' as const, sortable: true,
        render: (val: any, row: any) => marginCell(p.color)(val, row, p.key),
      })),
      {
        key: 'gap', label: 'Alt − Eng', align: 'center' as const, sortable: true,
        render: (val: any) => (
          <span className={`text-xs font-mono font-bold ${val > 0 ? 'text-amber-600' : 'text-blue-600'}`}>
            {val >= 0 ? '+' : ''}{(val ?? 0).toFixed(3)}
          </span>
        ),
      },
    ];
  }, []);

  const tableData = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.languages)
      .map(([code, entry]) => {
        const row: any = { code, name: langName(code) };
        PIVOTS.forEach((p) => {
          row[p.key] = entry[p.code]?.margin ?? 0;
          row[p.key + 'Mexa'] = entry[p.code]?.mexa ?? 0;
        });
        row.gap = row[altConf.key] - row.eng;
        return row;
      })
      .sort((a, b) => a.eng - b.eng);
  }, [data, altConf, languageNames]);

  return (
    <div className="p-12 space-y-12">
      {/* Page Header */}
      <div className="max-w-4xl">
        <div className="flex items-center gap-3 mb-3">
          <span className="material-symbols-outlined text-3xl text-primary">straighten</span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            Metric Diagnostics
          </span>
        </div>
        <h2 className="text-4xl font-headline font-extrabold text-primary tracking-tight mb-4">
          Pivot Margin Analysis
        </h2>
        <p className="text-on-surface-variant font-body leading-relaxed max-w-3xl italic">
          Why does English, the presumed hub language, score <em>lower</em> as a pivot than Arabic, German, or French?
          MEXA counts, per sentence, whether the true parallel pair beats every distractor. The quantity it thresholds
          on is the <strong>margin</strong>: true-pair similarity minus the best distractor. This page measures that
          margin directly, showing that English imposes the <em>strictest</em> test, its margins are the largest for
          well-aligned languages, while its lower average score comes from low-resource languages whose margins hover
          at zero. Basque (eus_Latn), a language isolate, is included as a maximally peripheral pivot to probe the
          opposite extreme.
        </p>
      </div>

      {/* Key Findings */}
      <section className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
        <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary/70">lightbulb</span>
          Key Findings
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10">
            <div className="text-[10px] uppercase tracking-widest font-bold text-blue-600 mb-2">1 · Compression ladder</div>
            <h4 className="font-headline font-bold text-sm text-on-surface mb-2">
              Compression tracks training exposure, not script
            </h4>
            <p className="text-xs text-on-surface-variant font-body leading-relaxed">
              Within-language similarity rises monotonically as a pivot's resource level falls, for Llama 3.1 8B:
              English 0.612 &lt; German 0.653 &lt; French 0.658 &lt; <strong>Chinese 0.666</strong> &lt; Arabic 0.692
              &lt; <strong>Basque 0.729</strong>. Chinese, high-resource but non-Latin script, lands with the
              high-resource Latin pivots, not with Arabic: it is <em>resource level</em>, not script, that drives
              compression. Raw MEXA difficulty is therefore pivot-dependent by construction.
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10">
            <div className="text-[10px] uppercase tracking-widest font-bold text-amber-600 mb-2">2 · Inflation</div>
            <h4 className="font-headline font-bold text-sm text-on-surface mb-2">
              Compressed pivots flip failing languages to wins
            </h4>
            <p className="text-xs text-on-surface-variant font-body leading-relaxed">
              Languages whose margin is negative under English but positive under a compressed pivot drive the
              apparent "English is worse" effect, for Llama 3.1 8B: 7 languages flip under Arabic and{' '}
              <strong>9 under Basque</strong> (shaded region in the scatter below). The blurrier the pivot's space,
              the more near-zero-signal languages sneak past the distractor floor. English's margins remain the
              largest for well-aligned languages, it is the sharpest grader, not the weakest hub.
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10">
            <div className="text-[10px] uppercase tracking-widest font-bold text-rose-600 mb-2">3 · Deflation</div>
            <h4 className="font-headline font-bold text-sm text-on-surface mb-2">
              A pivot the model barely knows caps every score
            </h4>
            <p className="text-xs text-on-surface-variant font-body leading-relaxed">
              Compression helps per-comparison, but MEXA(pivot → X) is ultimately capped by the pivot's own
              representation quality. Mistral 7B v0.3 barely differentiates Basque (within-language sim{' '}
              <strong>0.864</strong> vs 0.511 for English) and its Basque-pivot mean collapses to{' '}
              <strong>0.216</strong> vs 0.498 with English. Well-represented peripheral pivots inflate; poorly
              represented ones deflate, English is the only pivot that is both well-represented <em>and</em> the
              model's internal hub.
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10">
            <div className="text-[10px] uppercase tracking-widest font-bold text-cyan-600 mb-2">4 · Hub follows provenance</div>
            <h4 className="font-headline font-bold text-sm text-on-surface mb-2">
              Chinese is hub-like in Qwen, peripheral in Llama
            </h4>
            <p className="text-xs text-on-surface-variant font-body leading-relaxed">
              For Qwen3.5 9B (a Chinese-lab model), Chinese's space is as sharp as English's (within-language sim{' '}
              <strong>0.892 vs 0.891</strong>) and Chinese-as-pivot grades as strictly as English does. For Llama and
              Mistral, Chinese is clearly more compressed than English (0.666 vs 0.612; 0.652 vs 0.511). The hub is
              not English per se, it is whatever dominated the model's training distribution.
            </p>
          </div>
        </div>
      </section>

      {/* Controls */}
      <div className="flex flex-wrap gap-6 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Selected Model</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-xs font-headline font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 w-60"
          >
            {MODELS.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Compare English against</label>
          <div className="bg-surface-container-lowest border border-outline-variant/15 p-1 rounded-xl flex gap-1 h-[45px] items-center">
            {PIVOTS.filter((p) => p.code !== 'eng_Latn').map((p) => (
              <button
                key={p.code}
                onClick={() => setAltPivot(p.code)}
                className={`px-4 py-1.5 rounded-lg text-xs font-headline font-bold transition-all flex items-center gap-2 ${
                  altPivot === p.code ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color, opacity: altPivot === p.code ? 1 : 0.35 }} />
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Layer-curve language</label>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-xs font-headline font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 w-60"
          >
            {availableLangs.map((l) => (
              <option key={l.code} value={l.code}>{l.name} ({l.code})</option>
            ))}
          </select>
        </div>
      </div>

      {loading || !data ? (
        <div className="w-full h-[300px] flex flex-col items-center justify-center gap-4 text-on-surface-variant/40">
          <span className="icon text-3xl animate-spin">refresh</span>
          <span className="text-[10px] uppercase font-bold tracking-widest">Loading Margin Data...</span>
        </div>
      ) : (
        <>
          {/* Geometry stat tiles */}
          <section className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
            <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider mb-2">
              Pivot Space Geometry · layer {data.geometryLayer}
            </h3>
            <p className="text-xs text-on-surface-variant font-body leading-relaxed max-w-3xl mb-6">
              <strong>Within-language similarity</strong> is the mean cosine between different sentences of the pivot
              itself, higher means a more compressed, less differentiated space. <strong>Distractor floor</strong> is the
              mean similarity of pivot sentences to non-parallel sentences of other languages. English has the most
              spread-out space and the lowest floor: it is the sharpest grader.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {PIVOTS.map((p) => {
                const g = data.geometry[p.code];
                if (!g) return null;
                return (
                  <div key={p.code} className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-xs font-headline font-bold text-on-surface uppercase tracking-wider">{p.label}</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-2xl font-headline font-extrabold text-on-surface tabular-nums">{g.withinSim.toFixed(3)}</div>
                        <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">within-language sim</div>
                      </div>
                      <div>
                        <div className="text-lg font-headline font-bold text-on-surface-variant tabular-nums">{g.baselineSim.toFixed(3)}</div>
                        <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant opacity-70">distractor floor</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Margin scatter */}
          <section className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
            <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider mb-2">
              Margin per Language · English vs {altConf.label} Pivot
            </h3>
            <p className="text-xs text-on-surface-variant font-body leading-relaxed max-w-3xl mb-6">
              Each dot is a language, placed by its mean margin (true pair − best distractor, at each pivot's best
              layer). Dots above the diagonal have an easier test under the {altConf.label} pivot. The shaded region
              marks languages whose margin is negative under English but positive under {altConf.label}, currently{' '}
              <strong>{flipped.length}</strong> language{flipped.length === 1 ? '' : 's'}, these drive the apparent
              "English is worse" effect. Click a dot to inspect its layer curve below.
            </p>
            <ResponsiveContainer width="100%" height={440}>
              <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e4" opacity={0.5} />
                <XAxis
                  type="number" dataKey="x" domain={scatterDomain}
                  stroke="#3f484c" fontSize={10} tickLine={false}
                  tickFormatter={(v: number) => v.toFixed(2)}
                  label={{ value: 'Margin under English pivot', position: 'insideBottom', dy: 22, fontSize: 11, fontWeight: 700, fill: '#3b82f6' }}
                />
                <YAxis
                  type="number" dataKey="y" domain={scatterDomain}
                  stroke="#3f484c" fontSize={10} tickLine={false}
                  tickFormatter={(v: number) => v.toFixed(2)}
                  label={{ value: `Margin under ${altConf.label} pivot`, angle: -90, position: 'insideLeft', dx: 4, fontSize: 11, fontWeight: 700, fill: altConf.color }}
                />
                <ZAxis range={[70, 70]} />
                <ReferenceArea x1={scatterDomain[0]} x2={0} y1={0} y2={scatterDomain[1]} fill={altConf.color} fillOpacity={0.07} />
                <ReferenceLine x={0} stroke="#3f484c" strokeOpacity={0.35} />
                <ReferenceLine y={0} stroke="#3f484c" strokeOpacity={0.35} />
                <ReferenceLine
                  segment={[{ x: scatterDomain[0], y: scatterDomain[0] }, { x: scatterDomain[1], y: scatterDomain[1] }]}
                  stroke="#3f484c" strokeDasharray="5 4" strokeOpacity={0.45}
                />
                <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter
                  data={scatterData} fill="#64748b" fillOpacity={0.55}
                  onClick={(d: any) => d?.code && setSelectedLang(d.code)}
                  className="cursor-pointer"
                />
                <Scatter
                  data={scatterData.filter((d) => d.code === selectedLang)}
                  fill={altConf.color} stroke="#fff" strokeWidth={2}
                >
                  <LabelList dataKey="name" position="top" style={{ fontSize: 10, fontWeight: 700, fill: '#3f484c' }} />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </section>

          {/* Margin by layer */}
          <section className="bg-surface-container-low rounded-2xl p-8 border border-outline-variant/10">
            <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider mb-2">
              Margin across Layers · {langName(selectedLang)} <span className="font-mono text-sm opacity-60">{selectedLang}</span>
            </h3>
            <p className="text-xs text-on-surface-variant font-body leading-relaxed max-w-3xl mb-6">
              Mean margin at every layer, one line per pivot. Where a line sits above zero, the true parallel pair
              typically beats all distractors and MEXA counts a win. Max-pooling over layers picks each line's peak, for near-zero curves, small geometric differences between pivots decide the final score.
            </p>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={layerData} margin={{ top: 10, right: 50, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e1e3e4" vertical={false} opacity={0.5} />
                <XAxis
                  dataKey="layer" stroke="#3f484c" fontSize={10} tickLine={false} axisLine={false}
                  label={{ value: 'Layer', position: 'insideBottom', dy: 10, fontSize: 11, fontWeight: 700, fill: '#3f484c' }}
                />
                <YAxis
                  stroke="#3f484c" fontSize={10} tickLine={false} axisLine={false}
                  tickFormatter={(v: number) => (v >= 0 ? '+' : '') + v.toFixed(2)}
                />
                <ReferenceLine y={0} stroke="#3f484c" strokeOpacity={0.4} />
                <Tooltip content={<LayerTooltip />} />
                <Legend
                  verticalAlign="top" align="right" iconType="circle"
                  formatter={(value: string) => PIVOTS.find((p) => p.key === value)?.label || value}
                  wrapperStyle={{ paddingBottom: 20, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}
                />
                {PIVOTS.map((p) => (
                  <Line
                    key={p.key} type="monotone" dataKey={p.key} name={p.key}
                    stroke={p.color} strokeWidth={2} dot={false}
                    activeDot={{ r: 4 }}
                  >
                    <LabelList content={endLabel(p.key, p.color)} />
                  </Line>
                ))}
              </LineChart>
            </ResponsiveContainer>
          </section>

          {/* Full table */}
          <div className="bg-surface-container-low p-10 rounded-2xl border border-outline-variant/10">
            <DataTable
              title="Margins and MEXA Scores by Pivot"
              subtitle={`${MODELS.find((m) => m.key === selectedModel)?.label} / FLORES Table 1 (100 sents), each cell: margin · MEXA at the pivot's best layer; sorted by English margin ascending`}
              columns={tableColumns}
              data={tableData}
              rowsPerPage={15}
              enableSearch
              searchPlaceholder="Search by language name or code..."
              enableSorting
              enableExport
              exportFilename={`margin-analysis-${selectedModel}`}
              enableDensityToggle
            />
          </div>
        </>
      )}
    </div>
  );
}
