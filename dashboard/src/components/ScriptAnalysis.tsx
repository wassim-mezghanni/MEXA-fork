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
  LabelList,
} from 'recharts';
import { getScriptName, scriptGroup } from '../utils/scriptNames';

interface ScriptPoint {
  script: string;
  name: string;
  group: 'Latin' | 'Arabic' | 'Other';
  fertility: number;   // mean tokens/sentence across the script's languages
  alignment: number;   // mean MEXA alignment across the script's languages
  count: number;       // number of languages using this script
}

const GROUP_COLOR: Record<ScriptPoint['group'], string> = {
  Latin: '#004655',
  Arabic: '#d97706',
  Other: '#13677b',
};

type Dataset = 'flores' | 'bible';

/** Aggregate per-language fertility rows into one point per script. */
function aggregateByScript(text: string): ScriptPoint[] {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  const iScript = headers.indexOf('script');
  const iFert = headers.indexOf('fertility');
  const iAlign = headers.indexOf('alignment');
  const groups: Record<string, { fert: number[]; align: number[] }> = {};
  for (let i = 1; i < lines.length; i++) {
    const c = lines[i].split(',');
    const script = c[iScript];
    const fert = parseFloat(c[iFert]);
    const align = parseFloat(c[iAlign]);
    if (!script || isNaN(fert) || isNaN(align)) continue;
    (groups[script] ??= { fert: [], align: [] }).fert.push(fert);
    groups[script].align.push(align);
  }
  const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  return Object.entries(groups)
    .map(([script, v]) => ({
      script,
      name: getScriptName(script),
      group: scriptGroup(script),
      fertility: parseFloat(mean(v.fert).toFixed(1)),
      alignment: parseFloat(mean(v.align).toFixed(4)),
      count: v.fert.length,
    }))
    .sort((a, b) => b.count - a.count);
}

export default function ScriptAnalysis() {
  const [data, setData] = useState<Record<Dataset, ScriptPoint[] | null>>({ flores: null, bible: null });
  const [active, setActive] = useState<Dataset>('flores');
  const [minLangs, setMinLangs] = useState(1);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    const load = (p: string) => fetch(p).then((r) => (r.ok ? r.text() : null)).catch(() => null);
    Promise.all([load('/data/fertility_flores.csv'), load('/data/fertility_bible.csv')]).then(
      ([f, b]) => {
        const flores = f ? aggregateByScript(f) : null;
        const bible = b ? aggregateByScript(b) : null;
        setData({ flores, bible });
        if (!flores && !bible) setStatus('missing');
        else { setActive(flores ? 'flores' : 'bible'); setStatus('ready'); }
      }
    );
  }, []);

  const allPoints = data[active] ?? [];
  const bibleAvailable = !!data.bible;
  const points = useMemo(() => allPoints.filter((p) => p.count >= minLangs), [allPoints, minLangs]);
  const hidden = allPoints.length - points.length;

  const byGroup = useMemo(() => {
    const g: Record<string, ScriptPoint[]> = { Latin: [], Arabic: [], Other: [] };
    points.forEach((p) => g[p.group].push(p));
    return g;
  }, [points]);

  const CustomTooltip = ({ active: a, payload }: any) => {
    if (!a || !payload?.length) return null;
    const p = payload[0]?.payload as ScriptPoint;
    if (!p) return null;
    return (
      <div className="bg-primary text-on-primary py-3 px-4 rounded-lg shadow-xl text-xs">
        <p className="font-headline font-bold text-sm leading-tight mb-1">{p.name}</p>
        <p className="font-mono text-[9px] uppercase tracking-widest opacity-70 mb-2">{p.script}</p>
        <p>Languages: <strong className="font-mono text-white">{p.count}</strong></p>
        <p>Avg fertility: <strong className="font-mono text-white">{p.fertility.toFixed(1)}</strong> tokens/sentence</p>
        <p>Avg alignment: <strong className="font-mono text-white">{p.alignment.toFixed(3)}</strong> MEXA</p>
      </div>
    );
  };

  if (status === 'missing') {
    return (
      <div className="bg-surface-container-low rounded-xl p-8 text-sm text-on-surface-variant font-label">
        <p className="font-semibold text-on-surface mb-2">Script-Level Analysis</p>
        <p>Run <code className="text-on-surface">python scratch/build_fertility_data.py</code> to generate the fertility data this chart needs.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low rounded-xl p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="max-w-3xl">
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider">
            Script-Level Analysis · All Writing Systems
          </h3>
          <p className="text-xs text-on-surface-variant font-body mt-1">
            Every script in the corpus as one bubble: x = mean tokenizer fertility, y = mean MEXA alignment,
            bubble size = number of languages using that script. {points.length} scripts shown for{' '}
            {active === 'bible' ? 'the Bible corpus' : 'FLORES-200'}
            {hidden > 0 && <> ({hidden} thin scripts below the threshold hidden)</>}. Scripts in the high-fertility /
            low-alignment corner (bottom-right) are the ones the tokenizer handles worst.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {bibleAvailable && (
            <div className="flex gap-1 bg-surface-container-lowest p-1 rounded-lg">
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
          <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded-lg">
            <span className="text-[9px] uppercase tracking-wider text-on-surface-variant font-bold px-1">Min langs</span>
            {[1, 3, 5].map((n) => (
              <button
                key={n}
                onClick={() => setMinLangs(n)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${minLangs === n
                  ? 'bg-primary text-white'
                  : 'text-on-surface-variant hover:text-primary'}`}
              >
                ≥{n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {status === 'loading' ? (
        <div className="h-[520px] flex items-center justify-center text-on-surface-variant/40 text-xs uppercase tracking-widest font-bold">
          Loading script data…
        </div>
      ) : (
        <div className="h-[520px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 26, left: 6 }}>
              <CartesianGrid stroke="rgba(113, 121, 113, 0.12)" />
              <XAxis
                type="number"
                dataKey="fertility"
                name="Fertility"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#717971', fontSize: 10 }}
                label={{ value: 'Mean tokenizer fertility (tokens / sentence)', position: 'insideBottom', offset: -12, fill: '#717971', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                type="number"
                dataKey="alignment"
                name="Alignment"
                domain={[0, 1]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#717971', fontSize: 10 }}
                label={{ value: 'Mean MEXA alignment', angle: -90, position: 'insideLeft', offset: 16, fill: '#717971', fontSize: 11, fontWeight: 600 }}
              />
              <ZAxis type="number" dataKey="count" range={[60, 900]} name="Languages" />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              {(['Other', 'Latin', 'Arabic'] as const).map((g) => (
                <Scatter key={g} data={byGroup[g]} fill={GROUP_COLOR[g]} fillOpacity={0.55} stroke={GROUP_COLOR[g]} strokeOpacity={0.9}>
                  {/* Labels only when uncrowded — otherwise they collide; raise the threshold to reveal */}
                  {points.length <= 14 && (
                    <LabelList dataKey="name" position="top" style={{ fill: '#414942', fontSize: 9, fontWeight: 600 }} />
                  )}
                </Scatter>
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
