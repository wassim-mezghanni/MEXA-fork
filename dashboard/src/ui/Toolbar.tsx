import React from 'react';

export interface ToolbarProps {
  search?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function Toolbar({
  search,
  actions,
  className = '',
}: ToolbarProps) {
  if (!search && !actions) return null;

  return (
    <div className={`flex flex-col sm:flex-row gap-4 items-center justify-between ${className}`}>
      <div className="w-full sm:w-80">
        {search}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
