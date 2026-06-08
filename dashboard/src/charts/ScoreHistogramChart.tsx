import { useState, useMemo } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Select } from '../form/Select';

type Score = number | null;

export interface SizeChartVariant {
  /** Stable key matching the keys used in each row's `scores` record. */
  key: string;
  /** Human label shown in the dropdown. */
  label: string;
  /** Optional secondary line shown under the label (e.g. "116 langs · 2000 sents"). */
  subtitle?: string;
}

export interface SizeChartRow {
  /** Display name, e.g. "Qwen3 8B Base". */
  model: string;
  /** Model size in billions of parameters. */
  sizeB: number;
  /** MEXA scores keyed by experiment variant. */
  scores: Record<string, { max: Score; mean: Score }>;
}

export interface ScoreHistogramChartProps {
  title: string;
  subtitle?: string;
  rows: SizeChartRow[];
  variants: SizeChartVariant[];
  /** Variant selected on first render. Defaults to the first variant. */
  defaultVariantKey?: string;
  className?: string;
  height?: number;
}

interface BinData {
  binLabel: string;
  maxCount: number;
  meanCount: number;
  maxModels: { model: string; score: number }[];
  meanModels: { model: string; score: number }[];
}

const MAX_COLOR = '#004655';   // primary teal — µ_Max
const MEAN_COLOR = '#d97706';  // amber — µ_Mean

export function ScoreHistogramChart({
  title,
  subtitle,
  rows,
  variants,
  defaultVariantKey,
  className = '',
  height = 380,
}: ScoreHistogramChartProps) {
  const [variantKey, setVariantKey] = useState(defaultVariantKey ?? variants[0]?.key);
  const [binWidth, setBinWidth] = useState<0.1 | 0.2>(0.2);

  const activeVariant = variants.find((v) => v.key === variantKey) ?? variants[0];

  const binData = useMemo(() => {
    const step = binWidth;
    const binsCount = Math.round(1.0 / step);
    const bins: BinData[] = [];

    for (let i = 0; i < binsCount; i++) {
      const start = i * step;
      const end = (i + 1) * step;
      const label = `${start.toFixed(1)}–${end.toFixed(1)}`;
      bins.push({
        binLabel: label,
        maxCount: 0,
        meanCount: 0,
        maxModels: [],
        meanModels: [],
      });
    }

    for (const r of rows) {
      const s = r.scores[variantKey];
      if (!s) continue;

      if (s.max !== null && s.max !== undefined) {
        let binIdx = Math.floor(s.max / step);
        if (binIdx >= binsCount) binIdx = binsCount - 1;
        if (binIdx < 0) binIdx = 0;
        bins[binIdx].maxCount += 1;
        bins[binIdx].maxModels.push({ model: r.model, score: s.max });
      }

      if (s.mean !== null && s.mean !== undefined) {
        let binIdx = Math.floor(s.mean / step);
        if (binIdx >= binsCount) binIdx = binsCount - 1;
        if (binIdx < 0) binIdx = 0;
        bins[binIdx].meanCount += 1;
        bins[binIdx].meanModels.push({ model: r.model, score: s.mean });
      }
    }

    // Sort models within each bin by score descending
    for (const b of bins) {
      b.maxModels.sort((a, b) => b.score - a.score);
      b.meanModels.sort((a, b) => b.score - a.score);
    }

    return bins;
  }, [rows, variantKey, binWidth]);

  const hasData = useMemo(() => {
    return binData.some(b => b.maxCount > 0 || b.meanCount > 0);
  }, [binData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload as BinData;
    if (!data) return null;

    return (
      <div className="bg-primary text-on-primary py-4 px-5 rounded-lg shadow-xl max-w-sm border border-outline/10 backdrop-blur-md bg-opacity-95">
        <p className="font-headline font-bold text-sm leading-tight border-b border-on-primary/10 pb-2 mb-3">
          Score Range: {data.binLabel}
        </p>

        {/* Max Section */}
        <div className="mb-3">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider mb-1">
            <span style={{ color: '#8de8ff' }}>µ_Max</span>
            <span>{data.maxCount} model{data.maxCount !== 1 ? 's' : ''}</span>
          </div>
          {data.maxModels.length > 0 ? (
            <ul className="text-xs space-y-1 pl-2 border-l border-on-primary/20">
              {data.maxModels.map((m, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span className="opacity-90 truncate max-w-[180px]">{m.model}</span>
                  <span className="font-mono">{m.score.toFixed(3)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] italic opacity-50 pl-2">No models</p>
          )}
        </div>

        {/* Mean Section */}
        <div>
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider mb-1">
            <span style={{ color: '#ffc15e' }}>µ_Mean</span>
            <span>{data.meanCount} model{data.meanCount !== 1 ? 's' : ''}</span>
          </div>
          {data.meanModels.length > 0 ? (
            <ul className="text-xs space-y-1 pl-2 border-l border-on-primary/20">
              {data.meanModels.map((m, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span className="opacity-90 truncate max-w-[180px]">{m.model}</span>
                  <span className="font-mono">{m.score.toFixed(3)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] italic opacity-50 pl-2">No models</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-surface-container-low rounded-xl p-8 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-xs text-on-surface-variant font-label mt-1">{subtitle}</p>}
        </div>
        <div className="flex gap-3 w-full md:w-auto shrink-0">
          <div className="w-32">
            <Select
              label="Bin Size"
              value={String(binWidth)}
              onChange={(e) => setBinWidth(Number(e.target.value) as 0.1 | 0.2)}
              options={[
                { value: '0.1', label: '0.1 (Fine)' },
                { value: '0.2', label: '0.2 (Coarse)' },
              ]}
            />
          </div>
          <div className="w-80">
            <Select
              label="Experiment"
              value={variantKey}
              onChange={(e) => setVariantKey(e.target.value)}
              options={variants.map((v) => ({
                value: v.key,
                label: v.subtitle ? `${v.label} — ${v.subtitle}` : v.label,
              }))}
            />
          </div>
        </div>
      </div>

      {activeVariant?.subtitle && (
        <p className="text-[11px] font-label text-on-surface-variant mb-2">
          Showing distribution for <span className="font-bold text-primary">{activeVariant.label}</span> · {activeVariant.subtitle}
        </p>
      )}

      {!hasData ? (
        <div className="flex items-center justify-center text-sm text-on-surface-variant font-label" style={{ height }}>
          No scores available for this experiment yet.
        </div>
      ) : (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={binData}
              margin={{ top: 24, right: 12, left: -20, bottom: 20 }}
            >
              <CartesianGrid stroke="rgba(113, 121, 113, 0.12)" vertical={false} />
              <XAxis
                dataKey="binLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#414942', fontSize: 11, fontWeight: 600, fontFamily: 'Inter' }}
                label={{ value: 'MEXA Score Range', position: 'insideBottom', offset: -10, fill: '#717971', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#717971', fontSize: 10, fontWeight: 500, fontFamily: 'Inter' }}
                label={{ value: 'Number of Models', angle: -90, position: 'insideLeft', offset: 0, fill: '#717971', fontSize: 11, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 70, 85, 0.04)' }} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingBottom: 12 }} />
              <Bar name="µ_Max" dataKey="maxCount" fill={MAX_COLOR} radius={[4, 4, 0, 0]} />
              <Bar name="µ_Mean" dataKey="meanCount" fill={MEAN_COLOR} radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
