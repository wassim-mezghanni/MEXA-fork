import { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

interface ScriptInfo { code: string; name: string; count: number; pct: number; }
interface LangInfo { code: string; iso: string; name: string; script: string; scriptName: string; }
interface Subset { name: string; langs: string; sents: string; note: string; }
interface DatasetDetails {
  id: string; name: string; fullName: string; source: string; license: string;
  description: string; numLanguages: number; numScripts: number; sentsPerLang: number;
  subsets: Subset[]; scripts: ScriptInfo[]; languages: LangInfo[];
}

const ACCENT: Record<string, { hero: string; bar: string }> = {
  flores: { hero: 'from-primary to-primary-container', bar: '#004655' },
  bible: { hero: 'from-tertiary to-secondary', bar: '#13677b' },
};

function StatCard({ value, label, sub }: { value: string | number; label: string; sub?: string }) {
  return (
    <div className="bg-surface-container-low rounded-xl p-6">
      <div className="text-4xl font-headline font-extrabold text-primary tracking-tight">{value}</div>
      <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mt-1">{label}</div>
      {sub && <div className="text-[10px] text-on-surface-variant/70 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function DatasetDetail({ dataset }: { dataset: 'flores' | 'bible' }) {
  const [d, setD] = useState<DatasetDetails | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');
  const [query, setQuery] = useState('');
  const [scriptFilter, setScriptFilter] = useState<string>('all');

  useEffect(() => {
    setStatus('loading');
    fetch(`/data/dataset_details_${dataset}.json`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((j: DatasetDetails) => { setD(j); setStatus('ready'); })
      .catch(() => setStatus('missing'));
  }, [dataset]);

  const accent = ACCENT[dataset];

  const filteredLangs = useMemo(() => {
    if (!d) return [];
    const q = query.trim().toLowerCase();
    return d.languages.filter((l) => {
      if (scriptFilter !== 'all' && l.script !== scriptFilter) return false;
      if (!q) return true;
      return l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q) || l.iso.includes(q);
    });
  }, [d, query, scriptFilter]);

  // The number of unique parallel sentence pairs the corpus enables (n choose 2 over languages,
  // ×sentences) is huge; we just show sentences × languages as the raw cell count.
  const totalCells = d ? (d.numLanguages * d.sentsPerLang).toLocaleString() : '—';

  if (status === 'missing') {
    return (
      <div className="bg-surface-container-low rounded-xl p-8 text-sm text-on-surface-variant font-label">
        <p className="font-semibold text-on-surface mb-2">Dataset details unavailable</p>
        <p>Run <code className="text-on-surface">python scratch/build_dataset_details.py</code> to generate{' '}
          <code className="text-on-surface">dataset_details_{dataset}.json</code>.</p>
      </div>
    );
  }
  if (status === 'loading' || !d) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-on-surface-variant/40 text-xs uppercase tracking-widest font-bold">
        Loading dataset…
      </div>
    );
  }

  const maxScriptCount = Math.max(...d.scripts.map((s) => s.count));

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className={`rounded-2xl p-10 bg-gradient-to-br ${accent.hero} text-white`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="material-symbols-outlined text-3xl">{dataset === 'bible' ? 'auto_stories' : 'local_florist'}</span>
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold bg-white/15 px-3 py-1 rounded-full">
            Dataset Reference
          </span>
        </div>
        <h1 className="text-4xl font-headline font-extrabold tracking-tight">{d.name}</h1>
        <p className="text-sm opacity-90 mt-1 font-body">{d.fullName}</p>
        <p className="max-w-3xl text-sm opacity-90 mt-4 leading-relaxed font-body">{d.description}</p>
        <div className="flex flex-wrap gap-x-8 gap-y-2 mt-6 text-xs">
          <div><span className="opacity-60 uppercase tracking-wider">Source</span><br /><span className="font-mono">{d.source}</span></div>
          <div><span className="opacity-60 uppercase tracking-wider">License</span><br /><span className="font-mono">{d.license}</span></div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={d.numLanguages} label="Languages" />
        <StatCard value={d.sentsPerLang} label="Sentences / language" sub="parallel, identical across all languages" />
        <StatCard value={d.numScripts} label="Writing systems" />
        <StatCard value={totalCells} label="Total sentences" sub="languages × sentences" />
      </div>

      {/* Subsets */}
      <section className="bg-surface-container-low rounded-xl p-8">
        <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider mb-4">Experiment Subsets</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold border-b border-outline-variant/20">
                <th className="text-left py-2 pr-4">Variant</th>
                <th className="text-left py-2 pr-4">Languages</th>
                <th className="text-left py-2 pr-4">Sentences</th>
                <th className="text-left py-2">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {d.subsets.map((s) => (
                <tr key={s.name} className="border-b border-outline-variant/10">
                  <td className="py-3 pr-4 font-semibold text-on-surface">{s.name}</td>
                  <td className="py-3 pr-4 font-mono text-primary">{s.langs}</td>
                  <td className="py-3 pr-4 font-mono text-primary">{s.sents}</td>
                  <td className="py-3 text-on-surface-variant text-xs">{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Script distribution */}
      <section className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-7 bg-surface-container-low rounded-xl p-8">
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider mb-1">Script Distribution</h3>
          <p className="text-xs text-on-surface-variant font-body mb-5">
            How the {d.numLanguages} languages split across {d.numScripts} writing systems. Click a bar's script in the
            table to filter the language list below.
          </p>
          <div style={{ height: Math.max(320, d.scripts.length * 22) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={d.scripts} margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(113,121,113,0.12)" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#717971', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={130} tick={{ fill: '#414942', fontSize: 10, fontWeight: 600 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,70,85,0.04)' }}
                  formatter={(v: any, _n: any, p: any) => [`${v} languages (${p.payload.pct}%)`, p.payload.name]}
                />
                <Bar dataKey="count" fill={accent.bar} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Script legend / quick stats */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-low rounded-xl p-8">
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider mb-4">All Scripts</h3>
          <div className="max-h-[420px] overflow-y-auto pr-2 space-y-1">
            <button
              onClick={() => setScriptFilter('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${scriptFilter === 'all' ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-container-high text-on-surface-variant'}`}
            >
              <span>All scripts</span><span className="font-mono">{d.numLanguages}</span>
            </button>
            {d.scripts.map((s) => (
              <button
                key={s.code}
                onClick={() => setScriptFilter(scriptFilter === s.code ? 'all' : s.code)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${scriptFilter === s.code ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-container-high text-on-surface'}`}
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-on-surface-variant w-9">{s.code}</span>
                  {s.name}
                </span>
                <span className="font-mono text-on-surface-variant">{s.count}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Language inventory */}
      <section className="bg-surface-container-low rounded-xl p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider">Language Inventory</h3>
            <p className="text-xs text-on-surface-variant font-body mt-1">
              {filteredLangs.length} of {d.numLanguages} languages
              {scriptFilter !== 'all' && <> · filtered to <strong>{d.scripts.find((s) => s.code === scriptFilter)?.name}</strong></>}
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search language or code…"
              className="w-full pl-10 pr-3 py-2 bg-surface-container-lowest border-none rounded-lg text-sm focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="max-h-[560px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface-container-low">
              <tr className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold border-b border-outline-variant/20">
                <th className="text-left py-2 pr-4">Code</th>
                <th className="text-left py-2 pr-4">Language</th>
                <th className="text-left py-2 pr-4">ISO 639-3</th>
                <th className="text-left py-2">Script</th>
              </tr>
            </thead>
            <tbody>
              {filteredLangs.map((l) => (
                <tr key={l.code} className="border-b border-outline-variant/10 hover:bg-surface-container-high/40">
                  <td className="py-2 pr-4 font-mono text-xs text-primary">{l.code}</td>
                  <td className="py-2 pr-4 text-on-surface">{l.name}</td>
                  <td className="py-2 pr-4 font-mono text-xs text-on-surface-variant">{l.iso}</td>
                  <td className="py-2 text-on-surface-variant text-xs">
                    <span className="font-mono text-[10px] mr-2">{l.script}</span>{l.scriptName}
                  </td>
                </tr>
              ))}
              {filteredLangs.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-on-surface-variant/60 text-sm">No languages match.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
