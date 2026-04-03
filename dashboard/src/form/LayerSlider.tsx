import React, { useState, useCallback } from 'react';

export interface LayerSliderProps {
  /** Minimum layer number */
  min?: number;
  /** Maximum layer number */
  max?: number;
  /** Current value (single) or [start, end] (range) */
  value: number | [number, number];
  /** Callback when value changes */
  onChange: (value: number | [number, number]) => void;
  /** Enable range mode (two thumbs) */
  range?: boolean;
  /** Step size */
  step?: number;
  /** Label displayed above the slider */
  label?: string;
  /** Show layer tick marks */
  showTicks?: boolean;
  /** Tick interval (e.g. every 4 layers) */
  tickInterval?: number;
  className?: string;
}

export const LayerSlider: React.FC<LayerSliderProps> = ({
  min = 1,
  max = 32,
  value,
  onChange,
  range = false,
  step = 1,
  label = 'Model Layer',
  showTicks = true,
  tickInterval = 4,
  className = '',
}) => {
  const isRange = range && Array.isArray(value);
  const singleVal = typeof value === 'number' ? value : value[0];
  const rangeStart = isRange ? (value as [number, number])[0] : singleVal;
  const rangeEnd = isRange ? (value as [number, number])[1] : singleVal;

  const [dragging, setDragging] = useState(false);

  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  const ticks = [];
  if (showTicks) {
    for (let i = min; i <= max; i += tickInterval) {
      ticks.push(i);
    }
    if (ticks[ticks.length - 1] !== max) ticks.push(max);
  }

  const handleSingleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange]
  );

  const handleRangeStartChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.min(Number(e.target.value), rangeEnd);
      onChange([v, rangeEnd]);
    },
    [onChange, rangeEnd]
  );

  const handleRangeEndChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Math.max(Number(e.target.value), rangeStart);
      onChange([rangeStart, v]);
    },
    [onChange, rangeStart]
  );

  return (
    <div className={`${className}`}>
      {/* Label + value display */}
      <div className="flex justify-between items-center mb-2">
        <label className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant">
          {label}
        </label>
        <div className="flex items-center gap-1">
          {isRange ? (
            <>
              <span className="bg-primary/10 text-primary text-xs font-bold font-mono px-2 py-0.5 rounded">
                {rangeStart}
              </span>
              <span className="text-on-surface-variant text-[10px]">—</span>
              <span className="bg-primary/10 text-primary text-xs font-bold font-mono px-2 py-0.5 rounded">
                {rangeEnd}
              </span>
            </>
          ) : (
            <span className="bg-primary/10 text-primary text-xs font-bold font-mono px-2 py-0.5 rounded">
              Layer {singleVal}
            </span>
          )}
        </div>
      </div>

      {/* Slider track */}
      <div className="relative h-10 flex items-center">
        {/* Background track */}
        <div className="absolute w-full h-1.5 bg-surface-container-high rounded-full" />

        {/* Active range fill */}
        <div
          className="absolute h-1.5 bg-gradient-to-r from-primary to-primary-container rounded-full transition-all"
          style={{
            left: `${isRange ? pct(rangeStart) : 0}%`,
            width: `${isRange ? pct(rangeEnd) - pct(rangeStart) : pct(singleVal)}%`,
          }}
        />

        {/* Input(s) */}
        {isRange ? (
          <>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={rangeStart}
              onChange={handleRangeStartChange}
              onMouseDown={() => setDragging(true)}
              onMouseUp={() => setDragging(false)}
              className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform z-20"
            />
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={rangeEnd}
              onChange={handleRangeEndChange}
              onMouseDown={() => setDragging(true)}
              onMouseUp={() => setDragging(false)}
              className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-container [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform z-20"
            />
          </>
        ) : (
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={singleVal}
            onChange={handleSingleChange}
            onMouseDown={() => setDragging(true)}
            onMouseUp={() => setDragging(false)}
            className="absolute w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform z-20"
          />
        )}
      </div>

      {/* Tick marks */}
      {showTicks && (
        <div className="relative w-full h-4 mt-0.5">
          {ticks.map((tick) => (
            <div
              key={tick}
              className="absolute flex flex-col items-center -translate-x-1/2"
              style={{ left: `${pct(tick)}%` }}
            >
              <div className="w-px h-1.5 bg-outline-variant" />
              <span className="text-[8px] text-on-surface-variant font-mono mt-0.5">{tick}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LayerSlider;
