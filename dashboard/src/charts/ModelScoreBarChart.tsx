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

export interface BarChartVariant {
  /** Stable key matching the keys used in each row's `scores` record. */
  key: string;
  /** Human label shown in the dropdown. */
  label: string;
  /** Optional secondary line shown under the label (e.g. "116 langs · 2000 sents"). */
  subtitle?: string;
}

export interface BarChartRow {
  /** Display name, e.g. "Qwen3 8B Base". */
  model: string;
  /** MEXA scores keyed by experiment variant. */
  scores: Record<string, { max: Score; mean: Score }>;
}

export interface ModelScoreBarChartProps {
  title: string;
  subtitle?: string;
  rows: BarChartRow[];
  variants: BarChartVariant[];
  /** Variant selected on first render. Defaults to the first variant. */
  defaultVariantKey?: string;
  className?: string;
  height?: number;
}

const MAX_COLOR = '#004655';   // primary teal — µ_Max
const MEAN_COLOR = '#d97706';  // amber — µ_Mean

export function ModelScoreBarChart({
  title,
  subtitle,
  rows,
  variants,
  defaultVariantKey,
  className = '',
  height = 380,
}: ModelScoreBarChartProps) {
  const [variantKey, setVariantKey] = useState(defaultVariantKey ?? variants[0]?.key);

  const activeVariant = variants.find((v) => v.key === variantKey) ?? variants[0];

  const chartData = useMemo(() => {
    return rows
      .map((r) => {
        const s = r.scores[variantKey];
        return {
          model: r.model,
          max: s?.max ?? null,
          mean: s?.mean ?? null,
        };
      })
      .filter((d) => d.max !== null || d.mean !== null);
  }, [rows, variantKey]);

  const hasData = chartData.length > 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-primary text-on-primary py-4 px-5 rounded-lg shadow-xl max-w-sm border border-outline/10 backdrop-blur-md bg-opacity-95">
        <p className="font-headline font-bold text-sm leading-tight border-b border-on-primary/10 pb-2 mb-3">
          {data.model}
        </p>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs gap-6">
            <span style={{ color: '#8de8ff' }} className="font-semibold uppercase tracking-wider">µ_Max</span>
            <span className="font-mono">{data.max !== null ? data.max.toFixed(4) : '—'}</span>
          </div>
          <div className="flex justify-between items-center text-xs gap-6">
            <span style={{ color: '#ffc15e' }} className="font-semibold uppercase tracking-wider">µ_Mean</span>
            <span className="font-mono">{data.mean !== null ? data.mean.toFixed(4) : '—'}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-surface-container-low rounded-xl p-8 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-xs text-on-surface-variant font-body mt-1">{subtitle}</p>}
        </div>
        <div className="w-full md:w-80 shrink-0">
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

      {activeVariant?.subtitle && (
        <p className="text-[11px] font-label text-on-surface-variant mb-2">
          Showing scores for <span className="font-bold text-primary">{activeVariant.label}</span> · {activeVariant.subtitle}
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
              data={chartData}
              margin={{ top: 24, right: 12, left: -20, bottom: 40 }}
            >
              <CartesianGrid stroke="rgba(113, 121, 113, 0.12)" vertical={false} />
              <XAxis
                dataKey="model"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#414942', fontSize: 10, fontWeight: 600, fontFamily: 'Inter' }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                domain={[0, 1.0]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#717971', fontSize: 10, fontWeight: 500, fontFamily: 'Inter' }}
                label={{ value: 'MEXA Score', angle: -90, position: 'insideLeft', offset: 0, fill: '#717971', fontSize: 11, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 70, 85, 0.04)' }} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingBottom: 12 }} />
              <Bar name="µ_Max" dataKey="max" fill={MAX_COLOR} radius={[4, 4, 0, 0]} />
              <Bar name="µ_Mean" dataKey="mean" fill={MEAN_COLOR} radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
