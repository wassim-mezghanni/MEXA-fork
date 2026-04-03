import React, { useEffect, useState } from 'react';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 0,
  className = '',
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (debounceMs === 0) return;
    const timer = setTimeout(() => onChange(localValue), debounceMs);
    return () => clearTimeout(timer);
  }, [localValue, debounceMs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setLocalValue(next);
    if (debounceMs === 0) onChange(next);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className={`relative w-full ${className}`}>
      <span className="icon absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
        search
      </span>
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="
          w-full
          bg-surface-container-high
          border-none
          rounded-lg
          py-4 pl-12 pr-10
          font-body
          text-on-surface
          placeholder:text-outline
          transition-all
          duration-300
          focus:ring-4
          focus:ring-primary/10
          focus:bg-surface-container-lowest
          focus:outline-none
        "
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors p-1 rounded"
          aria-label="Clear search"
        >
          <span className="icon text-[18px]">close</span>
        </button>
      )}
    </div>
  );
}
