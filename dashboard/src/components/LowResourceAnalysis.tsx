import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface LowResourceAnalysisProps {
  floresData: any[];
}

const SCRIPT_NAME_MAP: Record<string, string> = {
  Latn: 'Latin',
  Cyrl: 'Cyrillic',
  Arab: 'Arabic',
  Deva: 'Devanagari',
  Tfng: 'Tifinagh (Berber)',
  Olck: 'Ol Chiki (Santali)',
  Tibt: 'Tibetan',
  Mymr: 'Myanmar (Burmese)',
  Beng: 'Bengali',
  Grek: 'Greek',
  Hebr: 'Hebrew',
  Hang: 'Korean (Hangul)',
  Jpan: 'Japanese',
  Thai: 'Thai',
  Ethi: 'Ethiopic (Amharic)',
  Armn: 'Armenian',
  Geor: 'Georgian',
  Taml: 'Tamil',
  Telu: 'Telugu',
  Knda: 'Kannada',
  Mlym: 'Malayalam',
  Sinh: 'Sinhala',
  Guru: 'Gurmukhi (Punjabi)',
  Orya: 'Oriya (Odia)',
  Khmr: 'Khmer',
  Laoo: 'Lao',
};

export default function LowResourceAnalysis({ floresData }: LowResourceAnalysisProps) {
  const scriptData = useMemo(() => {
    if (!floresData || floresData.length === 0) return [];

    const groups: Record<string, { totalScore: number; count: number }> = {};

    floresData.forEach((row: any) => {
      const code = row.code;
      if (!code || code === 'eng_Latn') return;

      const parts = code.split('_');
      if (parts.length < 2) return;
      const script = parts[1];

      const score = parseFloat(row.avg);
      if (isNaN(score)) return;

      if (!groups[script]) {
        groups[script] = { totalScore: 0, count: 0 };
      }
      groups[script].totalScore += score;
      groups[script].count += 1;
    });

    return Object.entries(groups)
      .map(([script, info]) => {
        const avgScore = info.totalScore / info.count;
        const name = SCRIPT_NAME_MAP[script] || script;
        return {
          script,
          name,
          avgScore: parseFloat(avgScore.toFixed(4)),
          count: info.count,
        };
      })
      .sort((a, b) => b.avgScore - a.avgScore);
  }, [floresData]);

  const discrepancyData = useMemo(() => {
    if (!floresData || floresData.length === 0) return [];

    const targetPairs = [
      { name: 'Minangkabau', latn: 'min_Latn', alt: 'min_Arab' },
      { name: 'Banjar', latn: 'bjn_Latn', alt: 'bjn_Arab' },
      { name: 'Achinese', latn: 'ace_Latn', alt: 'ace_Arab' },
      { name: 'Kanuri', latn: 'knc_Latn', alt: 'knc_Arab' },
      { name: 'Kashmiri', latn: 'kas_Deva', latnLabel: 'Devanagari Script', alt: 'kas_Arab' },
    ];

    return targetPairs.map((pair) => {
      const rowLatn = floresData.find((r: any) => r.code === pair.latn);
      const rowAlt = floresData.find((r: any) => r.code === pair.alt);

      return {
        name: pair.name,
        latnScore: rowLatn ? parseFloat(rowLatn.avg) : 0,
        altScore: rowAlt ? parseFloat(rowAlt.avg) : 0,
        latnLabel: pair.latnLabel || 'Latin Script',
      };
    });
  }, [floresData]);

  const hasData = floresData && floresData.length > 0;

  const CustomScriptTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-primary text-on-primary py-3 px-4 rounded-lg shadow-xl text-xs border border-outline/10 backdrop-blur-md bg-opacity-95">
        <p className="font-headline font-bold text-sm leading-tight border-b border-on-primary/10 pb-1.5 mb-2">
          {data.name}
        </p>
        <p>Average Alignment: <strong className="font-mono text-white">{data.avgScore.toFixed(4)}</strong></p>
        <p className="opacity-85">Languages in group: {data.count}</p>
      </div>
    );
  };

  const CustomDiscrepancyTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-primary text-on-primary py-3 px-4 rounded-lg shadow-xl text-xs border border-outline/10 backdrop-blur-md bg-opacity-95">
        <p className="font-headline font-bold text-sm leading-tight border-b border-on-primary/10 pb-1.5 mb-2">
          {data.name} (Orthography Gap)
        </p>
        <p className="flex justify-between gap-6">
          <span>{data.latnLabel}:</span>
          <strong className="font-mono text-white">{data.latnScore.toFixed(4)}</strong>
        </p>
        <p className="flex justify-between gap-6">
          <span>Arabic Script:</span>
          <strong className="font-mono text-amber-300">{data.altScore.toFixed(4)}</strong>
        </p>
        <p className="mt-2 pt-1 border-t border-on-primary/10 text-[10px] opacity-75 italic text-red-300">
          Drop: -{((1 - data.altScore / (data.latnScore || 1)) * 100).toFixed(1)}% in alignment
        </p>
      </div>
    );
  };

  if (!hasData) {
    return (
      <div className="bg-surface-container-low rounded-xl p-8 h-80 flex items-center justify-center text-sm text-on-surface-variant font-label">
        Loading orthography and script discrepancy data...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Script performance chart */}
      <div className="col-span-12 lg:col-span-7 bg-surface-container-low rounded-xl p-8">
        <div className="mb-6">
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider">
            Script-wise Alignment Performance
          </h3>
          <p className="text-xs text-on-surface-variant font-body mt-1">
            Average alignment scores of languages grouped by writing script. Showing severe alignment collapse in Tifinagh, Ol Chiki, Tibetan, and Canadian Syllabics.
          </p>
        </div>

        <div className="h-[480px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={scriptData}
              margin={{ top: 10, right: 20, left: 30, bottom: 10 }}
            >
              <CartesianGrid stroke="rgba(113, 121, 113, 0.12)" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 1.0]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#717971', fontSize: 10 }}
                label={{ value: 'Average MEXA Alignment', position: 'insideBottom', offset: -5, fill: '#717971', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#414942', fontSize: 10, fontWeight: 600 }}
                width={120}
              />
              <Tooltip content={<CustomScriptTooltip />} cursor={{ fill: 'rgba(0, 70, 85, 0.03)' }} />
              <Bar name="Avg Alignment" dataKey="avgScore" fill="#004655" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orthographic discrepancy chart */}
      <div className="col-span-12 lg:col-span-5 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider">
            Orthographic Script Discrepancy
          </h3>
          <p className="text-xs text-on-surface-variant font-body mt-1">
            Direct comparison of the same language written in Latin (or Devanagari) vs. Arabic scripts. Exposes the tokenizer and representational penalty for minority scripts.
          </p>
        </div>

        <div className="h-[380px] my-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={discrepancyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
            >
              <CartesianGrid stroke="rgba(113, 121, 113, 0.12)" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#414942', fontSize: 10, fontWeight: 600 }}
              />
              <YAxis
                domain={[0, 1.0]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#717971', fontSize: 10 }}
              />
              <Tooltip content={<CustomDiscrepancyTooltip />} cursor={{ fill: 'rgba(0, 70, 85, 0.03)' }} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 10, paddingBottom: 10 }} />
              <Bar name="Latin / Devanagari" dataKey="latnScore" fill="#004655" radius={[4, 4, 0, 0]} />
              <Bar name="Arabic Script Variant" dataKey="altScore" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/50 text-amber-900 text-xs">
          <p className="font-semibold mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-amber-700">warning</span>
            The Script Representation Gap
          </p>
          <p className="leading-relaxed opacity-90">
            For languages like Minangkabau and Banjar, switching from Latin to Arabic orthography results in a <strong>90%+ collapse</strong> in alignment score. Since the semantic content is identical, this drop highlights how tokenization deficits isolate script variants.
          </p>
        </div>
      </div>
    </div>
  );
}
