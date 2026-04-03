import React from 'react';

export interface CategoryBarItem {
  id: string;
  label: string;
  icon: string;
  value: number;
}

export interface CategoryBarListProps {
  data: CategoryBarItem[];
  maxValue?: number;
  valueFormatter?: (value: number) => string;
  className?: string;
}

export const CategoryBarList: React.FC<CategoryBarListProps> = ({
  data,
  maxValue,
  valueFormatter = (v) => v.toString(),
  className = ''
}) => {
  // If max is not provided, find the max in the current data to scale automatically
  const max = maxValue ?? Math.max(...data.map(d => d.value), 1);

  return (
    <div className={`flex flex-col gap-8 ${className}`}>
      {data.map((item) => {
        const percentage = Math.min((item.value / max) * 100, 100);
        
        return (
          <div key={item.id} className="group">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <span className="icon text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {item.icon}
                </span>
                <span className="font-headline font-bold text-on-surface text-sm tracking-tight">
                  {item.label}
                </span>
              </div>
              <span className="font-body font-medium text-on-surface-variant text-sm">
                {valueFormatter(item.value)}
              </span>
            </div>
            
            <div className="w-full bg-surface-container-high h-4 rounded-full overflow-hidden">
              <div 
                className="bg-primary-container h-full rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
