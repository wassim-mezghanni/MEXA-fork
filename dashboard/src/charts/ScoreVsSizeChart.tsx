import { useState, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LabelList,
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
  /** Model size in billions of parameters — plotted on the X axis. */
  sizeB: number;
  /** MEXA scores keyed by experiment variant. */
  scores: Record<string, { max: Score; mean: Score }>;
}

export interface ScoreVsSizeChartProps {
  title: string;
  subtitle?: string;
  rows: SizeChartRow[];
  variants: SizeChartVariant[];
  /** Variant selected on first render. Defaults to the first variant. */
  defaultVariantKey?: string;
  /** Connect the points with a trend line (useful within a single model family). */
  showTrendLine?: boolean;
  className?: string;
  height?: number;
}

const MAX_COLOR = '#004655';   // primary teal — µ_Max
const MEAN_COLOR = '#d97706';  // amber — µ_Mean

const fmt = (v: number) => v.toFixed(3);

export function ScoreVsSizeChart({
  title,
  subtitle,
  rows,
  variants,
  defaultVariantKey,
  showTrendLine = false,
  className = '',
  height = 380,
}: ScoreVsSizeChartProps) {
  const [variantKey, setVariantKey] = useState(defaultVariantKey ?? variants[0]?.key);

  const activeVariant = variants.find((v) => v.key === variantKey) ?? variants[0];

  // Build per-series point arrays for the selected variant, dropping models
  // that have no score for this experiment. Sorted by size so the trend line
  // (when enabled) reads left-to-right.
  const { maxData, meanData } = useMemo(() => {
    const sorted = [...rows].sort((a, b) => a.sizeB - b.sizeB);
    const maxData: { sizeB: number; y: number; model: string }[] = [];
    const meanData: { sizeB: number; y: number; model: string }[] = [];
    for (const r of sorted) {
      const s = r.scores[variantKey];
      if (!s) continue;
      if (s.max !== null && s.max !== undefined) maxData.push({ sizeB: r.sizeB, y: s.max, model: r.model });
      if (s.mean !== null && s.mean !== undefined) meanData.push({ sizeB: r.sizeB, y: s.mean, model: r.model });
    }
    return { maxData, meanData };
  }, [rows, variantKey]);

  const hasData = maxData.length > 0 || meanData.length > 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0]?.payload;
    if (!p) return null;
    return (
      <div className="bg-primary text-on-primary py-3 px-4 rounded-lg shadow-xl">
        <p className="font-headline font-bold text-sm leading-tight mb-1">{p.model}</p>
        <p className="font-label text-[10px] uppercase tracking-widest opacity-70">{p.sizeB}B params</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="font-headline font-bold text-base leading-none mt-1" style={{ color: '#fff' }}>
            {entry.name}: {fmt(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  const PointLabel = (props: any) => {
    const { x, y, value } = props;
    if (x === undefined || y === undefined) return null;
    return (
      <text x={x} y={y - 10} textAnchor="middle" fill="#414942" fontSize={9} fontWeight={600} fontFamily="Inter">
        {value}
      </text>
    );
  };

  return (
    <div className={`bg-surface-container-low rounded-xl p-8 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-headline font-bold text-primary uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-xs text-on-surface-variant font-label mt-1">{subtitle}</p>}
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
          Showing <span className="font-bold text-primary">{activeVariant.label}</span> · {activeVariant.subtitle}
        </p>
      )}

      {!hasData ? (
        <div className="flex items-center justify-center text-sm text-on-surface-variant font-label" style={{ height }}>
          No scores available for this experiment yet.
        </div>
      ) : (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 24, right: 24, left: 8, bottom: 40 }}>
              <CartesianGrid stroke="rgba(113, 121, 113, 0.12)" />
              <XAxis
                type="number"
                dataKey="sizeB"
                name="Model size"
                unit="B"
                domain={[0, 'dataMax']}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#414942', fontSize: 11, fontWeight: 600, fontFamily: 'Inter' }}
                label={{ value: 'Model size (B params)', position: 'insideBottom', offset: -24, fill: '#717971', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="MEXA score"
                domain={[0, 'auto']}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => v.toFixed(2)}
                tick={{ fill: '#717971', fontSize: 10, fontWeight: 500, fontFamily: 'Inter' }}
                width={56}
                label={{ value: 'MEXA score', angle: -90, position: 'insideLeft', offset: 12, fill: '#717971', fontSize: 11, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '4 4', stroke: 'rgba(0,70,85,0.25)' }} />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingBottom: 8 }} />
              <Scatter
                name="µ_Max"
                data={maxData}
                fill={MAX_COLOR}
                line={showTrendLine ? { stroke: MAX_COLOR, strokeWidth: 2 } : false}
                lineType="joint"
              >
                <LabelList dataKey="model" content={<PointLabel />} />
              </Scatter>
              <Scatter
                name="µ_Mean"
                data={meanData}
                fill={MEAN_COLOR}
                line={showTrendLine ? { stroke: MEAN_COLOR, strokeWidth: 2, strokeDasharray: '5 4' } : false}
                lineType="joint"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
