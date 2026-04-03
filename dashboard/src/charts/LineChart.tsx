import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export interface LineChartSeries {
  key: string;
  color?: string;
  name?: string;
}

export interface LineChartProps {
  data: any[];
  xAxisKey: string;
  series: LineChartSeries[];
  height?: number | string;
  yAxisFormatter?: (value: number) => string;
  className?: string;
}

let chartIdCounter = 0;

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xAxisKey,
  series,
  height = 400,
  yAxisFormatter = (v) => v.toString(),
  className = ''
}) => {
  const chartId = useMemo(() => `line-chart-${chartIdCounter++}`, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-primary text-on-primary py-3 px-4 rounded-lg shadow-xl relative animate-in fade-in zoom-in duration-300">
          <p className="font-label text-[9px] uppercase tracking-widest opacity-70 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
             <p key={index} className="font-headline font-bold text-lg leading-none">
                {yAxisFormatter(entry.value)}
             </p>
          ))}
          <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45"></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`w-full relative ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 0, left: 12, bottom: 32 }}>
          <defs>
            {series.map((s, idx) => {
              const color = s.color || '#1A4D2E';
              return (
                <linearGradient key={idx} id={`color${s.key}${chartId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.12}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              )
            })}
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(113, 121, 113, 0.05)" />
          <XAxis 
            dataKey={xAxisKey} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#414942', fontSize: 11, fontWeight: 600, fontFamily: 'Inter' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={yAxisFormatter}
            tick={{ fill: '#717971', fontSize: 10, fontWeight: 500, fontFamily: 'Inter' }}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(26, 77, 46, 0.2)', strokeWidth: 1, strokeDasharray: '4 4' }} />
          {series.map((s, idx) => (
            <Area
              key={idx}
              type="monotone"
              dataKey={s.key}
              name={s.name || s.key}
              stroke={s.color || '#1A4D2E'}
              strokeWidth={3.5}
              fillOpacity={1}
              fill={`url(#color${s.key}${chartId})`}
              activeDot={{ r: 5, fill: s.color || '#1A4D2E', strokeWidth: 0, className: 'shadow-[0_4px_10px_rgba(26,77,46,0.5)]' }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
