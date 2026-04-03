import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export interface DonutChartData {
  id: string;
  name: string;
  value: number;
  color: string;
  subtext?: string;
}

export interface DonutChartProps {
  data: DonutChartData[];
  centerLabel?: string;
  centerValue?: string | number;
  centerTrend?: { value: number; label?: string };
  height?: number | string;
  className?: string;
  valueFormatter?: (value: number) => string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  centerLabel = 'Total Value',
  centerValue,
  centerTrend,
  height = 280,
  className = '',
  valueFormatter = (v) => v.toString()
}) => {
  const total = React.useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  return (
    <div className={`w-full flex flex-col items-center justify-center gap-8 ${className}`}>
      {/* Chart */}
      <div className="relative w-full flex-shrink-0" style={{ maxWidth: height, aspectRatio: '1 / 1' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart> 
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="90%"
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
               contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -5px rgba(25,28,29,0.1)' }}
               itemStyle={{ color: '#191C1D', fontWeight: 'bold', fontFamily: 'Inter' }}
               formatter={(value: number) => valueFormatter(value)}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="font-label text-xs font-medium text-outline uppercase tracking-widest">{centerLabel}</span>
          <span className="font-headline text-3xl font-extrabold text-on-surface mt-1">{centerValue ?? valueFormatter(total)}</span>
          {centerTrend && (
            <div className="mt-2 flex items-center gap-1 text-primary-container font-medium text-sm">
              <span className="icon text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                {centerTrend.value >= 0 ? 'trending_up' : 'trending_down'}
              </span>
              <span>{centerTrend.value > 0 ? '+' : ''}{centerTrend.value}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-5 w-full">
        {data.map((item) => {
          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
          return (
            <div key={item.id} className="flex items-center justify-between group cursor-default">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <div>
                  <p className="font-headline text-sm font-bold text-on-surface">{item.name}</p>
                  {item.subtext && <p className="font-body text-xs text-outline">{item.subtext}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="font-headline text-sm font-bold text-on-surface">{percentage}%</p>
                <p className="font-body text-xs text-outline">{valueFormatter(item.value)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
