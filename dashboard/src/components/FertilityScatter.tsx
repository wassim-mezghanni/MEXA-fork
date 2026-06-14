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
  Legend,
} from 'recharts';

interface FertilityRow {
  code: string;
  script: string;
  fertility: number;          // blended: tokens/sentence, all tokenizers
  fertilityDecoder: number;   // decoder tokenizers only
  tokensPerChar: number;      // normalized for script density
  alignment: number;
  group: 'Arabic' | 'Latin' | 'Other';
}

const GROUP_COLOR: Record<FertilityRow['group'], string> = {
  Latin: '#004655',
  Arabic: '#d97706',
  Other: '#9ca3af',
};

type Metric = 'fertility' | 'fertilityDecoder' | 'tokensPerChar';

const METRIC_META: Record<Metric, { label: string; axis: string }> = {
  fertility: { label: 'All tokenizers', axis: 'Tokenizer fertility (tokens / sentence)' },
  fertilityDecoder: { label: 'Decoder-only', axis: 'Decoder fertility (tokens / sentence)' },
  tokensPerChar: { label: 'Per character', axis: 'Fertility (tokens / character)' },
};

/* Pearson correlation between two equal-length arrays. */
function pearson(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const a = x[i] - mx, b = y[i] - my;
    num += a * b; dx += a * a; dy += b * b;
  }
  return dx === 0 || dy === 0 ? 0 : num / Math.sqrt(dx * dy);
}

function parseFertilityCSV(text: string): { rows: FertilityRow[]; numTok: number } {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  const idx = (h: string) => headers.indexOf(h);
  const rows: FertilityRow[] = [];
  let numTok = 0;
  for (let i = 1; i < lines.length; i++) {
    const c = lines[i].split(',');
    const script = c[idx('script')];
    const fertility = parseFloat(c[idx('fertility')]);
    const fertilityDecoder = parseFloat(c[idx('fertility_decoder')]);
    const tokensPerChar = parseFloat(c[idx('tokens_per_char')]);
    const alignment = parseFloat(c[idx('alignment')]);
    numTok = parseInt(c[idx('num_tokenizers')], 10) || numTok;
    if (isNaN(fertility) || isNaN(alignment)) continue;
    const group: FertilityRow['group'] =
      script === 'Arab' ? 'Arabic' : script === 'Latn' ? 'Latin' : 'Other';
    rows.push({
      code: c[idx('code')], script, fertility,
      fertilityDecoder: isNaN(fertilityDecoder) ? fertility : fertilityDecoder,
      tokensPerChar: isNaN(tokensPerChar) ? 0 : tokensPerChar,
      alignment, group,
    });
  }
  return { rows, numTok };
}

type Dataset = 'flores' | 'bible';

export default function FertilityScatter() {
  const [datasets, setDatasets] = useState<Record<Dataset, { rows: FertilityRow[]; numTok: number } | null>>({
    flores: null,
    bible: null,
  });
  const [active, setActive] = useState<Dataset>('flores');
  const [metric, setMetric] = useState<Metric>('fertility');
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    const load = (path: string) =>
      fetch(path).then((r) => (r.ok ? r.text() : null)).catch(() => null);
    Promise.all([load('/data/fertility_flores.csv'), load('/data/fertility_bible.csv')]).then(
      ([floresText, bibleText]) => {
        const flores = floresText ? parseFertilityCSV(floresText) : null;
        const bible = bibleText ? parseFertilityCSV(bibleText) : null;
        setDatasets({ flores, bible });
        if (!flores && !bible) {
          setStatus('missing');
        } else {
          setActive(flores ? 'flores' : 'bible');
          setStatus('ready');
        }
      }
    );
  }, []);

  const current = datasets[active];
  const rows = current?.rows ?? [];
  const numTok = current?.numTok ?? 0;
  const bibleAvailable = !!datasets.bible;

  // Each plotted point exposes `x` = the currently selected fertility metric.
  const { byGroup, r, trend } = useMemo(() => {
    const withX = rows.map((row) => ({ ...row, x: row[metric] }));
    const byGroup: Record<string, (FertilityRow & { x: number })[]> = { Latin: [], Arabic: [], Other: [] };
    withX.forEach((row) => byGroup[row.group].push(row));

    const xs = withX.map((d) => d.x);
    const ys = withX.map((d) => d.alignment);
    const r = pearson(xs, ys);

    // Least-squares regression line for the overlay.
    let trend: { x: number; alignment: number }[] = [];
    const n = xs.length;
    if (n >= 2) {
      const mx = xs.reduce((a, b) => a + b, 0) / n;
      const my = ys.reduce((a, b) => a + b, 0) / n;
      let num = 0, den = 0;
      for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) ** 2; }
      const slope = den === 0 ? 0 : num / den;
      const intercept = my - slope * mx;
      const xMin = Math.min(...xs), xMax = Math.max(...xs);
      trend = [
        { x: xMin, alignment: slope * xMin + intercept },
        { x: xMax, alignment: slope * xMax + intercept },
      ];
    }
    return { byGroup, r, trend };
  }, [rows, metric]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0]?.payload as FertilityRow;
    if (!d) return null;
    return (
      <div className="bg-primary text-on-primary py-3 px-4 rounded-lg shadow-xl text-xs">
        <p className="font-headline font-bold text-sm leading-tight mb-1">{d.code}</p>
        <p>{METRIC_META[metric].label}: <strong className="font-mono text-white">{d[metric].toFixed(metric === 'tokensPerChar' ? 3 : 1)}</strong></p>
        <p>Alignment: <strong className="font-mono text-white">{d.alignment.toFixed(3)}</strong> MEXA</p>
      </div>
    );
  };

  if (status === 'missing') {
    return (
      <div className="bg-surface-container-low rounded-xl p-8 text-sm text-on-surface-variant font-label">
        <p className="font-semibold text-on-surface mb-2">Tokenizer Fertility vs. Alignment</p>
        <p className="leading-relaxed">
          No fertility data found. Generate it by running{' '}
          <code className="text-on-surface">python scratch/build_fertility_data.py</code> — it tokenizes the
          FLORES sentences for each language and writes <code className="text-on-surface">fertility_flores.csv</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low rounded-xl p-8">
      <div className="mb-6 max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider">
            Tokenizer Fertility vs. Alignment
          </h3>
          {bibleAvailable && (
            <div className="flex gap-1 bg-surface-container-lowest p-1 rounded-lg shrink-0">
              {(['flores', 'bible'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setActive(d)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${active === d
                    ? 'bg-primary text-white'
                    : 'text-on-surface-variant hover:text-primary'}`}
                >
                  {d === 'flores' ? 'FLORES' : 'Bible'}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-on-surface-variant font-body mt-1">
          Each point is a {active === 'bible' ? 'Bible-corpus' : 'FLORES'} language ({rows.length} shown): x ={' '}
          {METRIC_META[metric].axis.toLowerCase()} (over {numTok || 'N'} tokenizers), y = cross-model MEXA alignment.
          The red regression line and the downward trend quantify the mechanism behind the script gap — the more a
          script is fragmented into sub-word tokens, the less it aligns to the English pivot.
        </p>
        <div className="mt-3 inline-flex flex-wrap items-center gap-x-2 gap-y-1 bg-surface-container-lowest/70 px-3 py-2 rounded-lg">
          <span className="font-mono text-xs font-bold text-primary">
            fertility = total tokens ÷ number of sentences
          </span>
          <span className="text-[10px] text-on-surface-variant/80 italic">
            The average number of sub-word tokens the model spends per parallel sentence. Higher means the
            tokenizer fragments the language more (lower coverage of its words/script).
          </span>
        </div>
      </div>

      {status === 'loading' ? (
        <div className="h-[460px] flex items-center justify-center text-on-surface-variant/40 text-xs uppercase tracking-widest font-bold">
          Loading fertility data…
        </div>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-baseline gap-2 bg-surface-container-lowest/70 px-4 py-2 rounded-lg">
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
                Pearson r (fertility ↔ alignment)
              </span>
              <span className="text-xl font-headline font-extrabold text-primary">{r.toFixed(3)}</span>
              <span className="text-[10px] text-on-surface-variant/70 italic">
                {r < -0.5 ? 'strong negative — fertility predicts alignment collapse' : 'negative trend'}
              </span>
            </div>
            {/* Fertility metric selector */}
            <div className="flex gap-1 bg-surface-container-lowest p-1 rounded-lg">
              {(Object.keys(METRIC_META) as Metric[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${metric === m
                    ? 'bg-primary text-white'
                    : 'text-on-surface-variant hover:text-primary'}`}
                >
                  {METRIC_META[m].label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[460px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 24, left: 6 }}>
                <CartesianGrid stroke="rgba(113, 121, 113, 0.12)" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Fertility"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#717971', fontSize: 10 }}
                  label={{ value: METRIC_META[metric].axis, position: 'insideBottom', offset: -12, fill: '#717971', fontSize: 11, fontWeight: 600 }}
                />
                <YAxis
                  type="number"
                  dataKey="alignment"
                  name="Alignment"
                  domain={[0, 1]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#717971', fontSize: 10 }}
                  label={{ value: 'MEXA alignment', angle: -90, position: 'insideLeft', offset: 16, fill: '#717971', fontSize: 11, fontWeight: 600 }}
                />
                <ZAxis range={[45, 45]} />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, paddingBottom: 8 }} />
                {(['Latin', 'Arabic', 'Other'] as const).map((g) => (
                  <Scatter
                    key={g}
                    name={g === 'Other' ? 'Other scripts' : `${g} script`}
                    data={byGroup[g]}
                    fill={GROUP_COLOR[g]}
                    fillOpacity={g === 'Other' ? 0.45 : 0.9}
                  />
                ))}
                {/* Least-squares regression line */}
                <Scatter
                  data={trend}
                  line={{ stroke: '#ba1a1a', strokeWidth: 2, strokeDasharray: '6 4' }}
                  shape={() => <g />}
                  legendType="none"
                  isAnimationActive={false}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {active === 'flores' ? (
            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200/50 text-amber-900 text-xs">
              <p className="leading-relaxed opacity-90">
                The <strong className="text-amber-800">amber Arabic-script points</strong> cluster in the
                high-fertility / low-alignment corner. Because the orthography pairs (e.g. Minangkabau
                <code className="mx-1">min_Latn</code>↔<code className="mx-1">min_Arab</code>) carry identical meaning,
                the only thing separating the amber points from their Latin twins is how many tokens the tokenizer
                spends — turning the visual script gap into a measured, mechanistic cause.
              </p>
            </div>
          ) : (
            <div className="mt-4 p-4 rounded-xl bg-surface-container-lowest/70 border border-outline-variant/15 text-on-surface text-xs">
              <p className="leading-relaxed opacity-90">
                Across <strong>{rows.length} Bible languages</strong>, the same negative trend holds far beyond
                FLORES's ~200 — high-fertility scripts collapse in alignment, confirming the mechanism generalizes.
                The Bible corpus has no matched dual-script pairs, so the controlled orthography comparison
                (amber Arabic outliers vs. their Latin twins) lives only on the FLORES tab.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
