import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export interface BarChartSeries {
  key: string;
  color?: string;
  name?: string;
}

export interface BarChartProps {
  data: any[];
  categoryKey: string;
  series: BarChartSeries[];
  layout?: 'horizontal' | 'vertical'; // horizontal = vertical bars, vertical = horizontal bars (recharts terminology)
  height?: number | string;
  valueFormatter?: (value: number) => string;
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  categoryKey,
  series,
  layout = 'vertical',
  height = 300,
  valueFormatter = (v) => v.toString(),
  className = ''
}) => {
  const isHorizontal = layout === 'vertical'; // Recharts vertical layout = horizontal bars

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-primary text-on-primary py-3 px-4 rounded-lg shadow-xl relative animate-in fade-in zoom-in duration-300">
          <p className="font-label text-[9px] uppercase tracking-widest opacity-70 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
             <p key={index} className="font-headline font-bold text-lg leading-none">
                {valueFormatter(entry.value)}
             </p>
          ))}
          {/* Tooltip Arrow - position depends on layout */}
          <div className={`absolute w-3 h-3 bg-primary rotate-45 ${
            isHorizontal 
            ? 'left-[-6px] top-1/2 -translate-y-1/2' 
            : 'bottom-[-6px] left-1/2 -translate-x-1/2'
          }`}></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`w-full relative ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          layout={layout}
          data={data}
          margin={isHorizontal ? { top: 5, right: 30, left: 20, bottom: 5 } : { top: 20, right: 20, left: 20, bottom: 32 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            horizontal={!isHorizontal} 
            vertical={isHorizontal} 
            stroke="rgba(113, 121, 113, 0.05)" 
          />
          
          {/* Category Axis */}
          {isHorizontal ? (
            <YAxis 
              dataKey={categoryKey} 
              type="category" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#414942', fontSize: 11, fontWeight: 600, fontFamily: 'Inter' }}
              width={100}
            />
          ) : (
            <XAxis 
              dataKey={categoryKey} 
              type="category" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#414942', fontSize: 11, fontWeight: 600, fontFamily: 'Inter' }}
              dy={10}
            />
          )}

          {/* Value Axis */}
          {isHorizontal ? (
            <XAxis 
              type="number" 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={valueFormatter}
              tick={{ fill: '#717971', fontSize: 10, fontWeight: 500, fontFamily: 'Inter' }}
            />
          ) : (
            <YAxis 
              type="number" 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={valueFormatter}
              tick={{ fill: '#717971', fontSize: 10, fontWeight: 500, fontFamily: 'Inter' }}
            />
          )}

          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: 'rgba(26, 77, 46, 0.05)' }} 
            {...(isHorizontal ? { position: { x: -100 } } : {})} 
          />
          
          {series.map((s, idx) => (
            <Bar 
              key={idx} 
              dataKey={s.key} 
              name={s.name || s.key} 
              fill={s.color || '#1A4D2E'} 
              radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              barSize={24}
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={s.color || '#1A4D2E'} fillOpacity={0.9} />
              ))}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};
