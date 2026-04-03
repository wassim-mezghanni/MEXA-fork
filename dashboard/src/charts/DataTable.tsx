import React, { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '../ui/Button.tsx';
import { SearchInput } from '../ui/SearchInput.tsx';
import { Pagination } from '../ui/Pagination.tsx';
import { FilterPanel, type FilterGroup } from '../ui/FilterPanel.tsx';
import { Toolbar } from '../ui/Toolbar.tsx';
import { exportToCsv } from '../utils/exportToCsv.ts';

export interface ColumnDef<T> {
  key: Extract<keyof T, string> | string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
  csvValue?: (value: any, row: T) => string;
  sortable?: boolean;
  filterable?: boolean;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  rowsPerPage?: number;
  className?: string;
  
  // Toolbar features
  enableSearch?: boolean;
  searchPlaceholder?: string;
  enableFilter?: boolean;
  enableExport?: boolean;
  exportFilename?: string;
  enableDensityToggle?: boolean;
  
  // Interactions
  enableSorting?: boolean;
  enableReordering?: boolean;
}

interface SortableHeaderProps {
  id: string;
  col: ColumnDef<any>;
  enableReordering: boolean;
  enableSorting: boolean;
  sortConfig: { key: string, direction: 'asc' | 'desc' } | null;
  onSort: (key: string) => void;
  headerPadding: string;
}

function SortableHeader({ id, col, enableReordering, enableSorting, sortConfig, onSort, headerPadding }: SortableHeaderProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.9 : 1,
    position: 'relative' as const,
  };

  const alignClass = col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : '';

  return (
    <th 
      ref={setNodeRef}
      style={style}
      className={`${headerPadding} group bg-surface-container-low/50 border-b border-outline-variant/10`}
    >
      <div className={`flex items-center gap-2 ${alignClass}`}>
        {enableReordering && (
          <div 
            {...attributes} 
            {...listeners} 
            className="cursor-grab active:cursor-grabbing text-outline opacity-40 hover:opacity-100 hover:text-primary transition-all p-1 -ml-2 rounded"
          >
            <span className="icon text-[16px] pointer-events-none">drag_indicator</span>
          </div>
        )}
        
        <div 
          className={`flex items-center gap-1 ${enableSorting && col.sortable ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
          onClick={() => {
            if (enableSorting && col.sortable) onSort(col.key as string);
          }}
        >
          <span className="text-xs font-headline font-bold text-on-surface-variant uppercase tracking-widest pointer-events-none select-none whitespace-nowrap">
            {col.label}
          </span>
          
          {enableSorting && col.sortable && (
            <span className="icon text-[16px] text-outline opacity-50 pointer-events-none select-none">
               {sortConfig?.key === col.key 
                 ? (sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward') 
                 : 'swap_vert'}
            </span>
          )}
        </div>
      </div>
    </th>
  );
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  title,
  subtitle,
  actions,
  rowsPerPage = 10,
  className = '',
  enableSearch = false,
  searchPlaceholder = 'Search records...',
  enableFilter,
  enableExport = false,
  exportFilename = 'export',
  enableDensityToggle = false,
  enableSorting = false,
  enableReordering = false
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  // Column Reordering State
  const [orderedColumnKeys, setOrderedColumnKeys] = useState(() => columns.map(c => c.key));
  useEffect(() => {
    setOrderedColumnKeys(columns.map(c => c.key));
  }, [columns]);

  // Apply Search -> Sort
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Search
    if (enableSearch && searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(row =>
        columns.some(col => {
          const val = row[col.key as keyof T];
          if (val === null || val === undefined) return false;
          if (typeof val === 'number') {
            // Match raw integer form, fixed-decimal form, and absolute value
            // so users can type "1240", "1240.00", or "42.50"
            const candidates = [
              String(val),
              val.toFixed(2),
              String(Math.abs(val)),
              Math.abs(val).toFixed(2),
            ];
            return candidates.some(s => s.includes(lower));
          }
          return String(val).toLowerCase().includes(lower);
        })
      );
    }

    // Column filters
    const filterEntries = Object.entries(activeFilters).filter(([, vals]) => vals.length > 0);
    if (filterEntries.length > 0) {
      result = result.filter(row =>
        filterEntries.every(([key, vals]) => vals.includes(String(row[key])))
      );
    }

    // Sort
    if (enableSorting && sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal === bVal) return 0;
        
        const isAsc = sortConfig.direction === 'asc';
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return isAsc ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        if (aStr < bStr) return isAsc ? -1 : 1;
        if (aStr > bStr) return isAsc ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, enableSearch, columns, enableSorting, sortConfig, activeFilters]);

  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);
  const currentData = filteredAndSortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const headerPadding = density === 'comfortable' ? 'py-5 px-8' : 'py-3 px-8';
  const cellPadding = density === 'comfortable' ? 'py-6 px-8' : 'py-3 px-8';

  const finalColumns = orderedColumnKeys
    .map(key => columns.find(c => c.key === key))
    .filter(Boolean) as ColumnDef<T>[];

  // Drag and Drop Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrderedColumnKeys((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  function handleExport() {
    exportToCsv(filteredAndSortedData, finalColumns, exportFilename);
  }

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        if (current.direction === 'asc') return { key, direction: 'desc' };
        return null;
      }
      return { key, direction: 'asc' };
    });
  };

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* Header */}
      {(title || subtitle || actions) && (
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            {subtitle && <span className="text-on-secondary-container font-label text-xs font-bold tracking-[0.15em] uppercase">{subtitle}</span>}
            {title && <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface">{title}</h1>}
          </div>
          {actions && <div className="flex gap-3">{actions}</div>}
        </header>
      )}

      {/* Toolbar */}
      {(enableSearch || enableFilter || enableExport || enableDensityToggle) && (
        <Toolbar
          className="mb-6"
          search={enableSearch ? (
            <SearchInput
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
                setCurrentPage(1);
              }}
            />
          ) : undefined}
          actions={<>
            {enableFilter && (
              <Button
                variant={filterOpen ? 'primary' : 'secondary'}
                icon="filter_list"
                onClick={() => setFilterOpen(v => !v)}
              >
                Filter{Object.values(activeFilters).flat().length > 0 ? ` (${Object.values(activeFilters).flat().length})` : ''}
              </Button>
            )}
            {enableDensityToggle && (
              <Button
                variant="secondary"
                icon={density === 'comfortable' ? 'view_headline' : 'view_compact'}
                onClick={() => setDensity(d => d === 'comfortable' ? 'compact' : 'comfortable')}
              >
                Density
              </Button>
            )}
            {enableExport && (
              <Button variant="primary" icon="download" onClick={handleExport}>Export CSV</Button>
            )}
          </>}
        />
      )}

      {/* Filter Card */}
      {enableFilter && filterOpen && (() => {
        const filterGroups: FilterGroup[] = columns
          .filter(c => c.filterable)
          .map(col => ({
            key: col.key as string,
            label: col.label,
            values: Array.from(new Set(data.map(row => String(row[col.key as string])))),
          }));
        return (
          <FilterPanel
            className="mb-6"
            groups={filterGroups}
            activeFilters={activeFilters}
            onFiltersChange={(filters) => {
              setActiveFilters(filters);
              setCurrentPage(1);
            }}
          />
        );
      })()}

      {/* Table Container */}
      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_10px_30px_-5px_rgba(25,28,29,0.05)] border border-outline-variant/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={orderedColumnKeys} strategy={horizontalListSortingStrategy}>
                  <tr>
                    {finalColumns.map((col) => (
                      <SortableHeader 
                        key={col.key as string}
                        id={col.key as string}
                        col={col}
                        enableReordering={enableReordering}
                        enableSorting={enableSorting}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                        headerPadding={headerPadding}
                      />
                    ))}
                  </tr>
                </SortableContext>
              </DndContext>
            </thead>
            <tbody className="divide-y divide-outline-variant/15 transition-all duration-300">
              {currentData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-surface transition-colors duration-200 group">
                  {finalColumns.map((col, colIndex) => {
                     const value = row[col.key as keyof T];
                     return (
                        <td 
                          key={colIndex} 
                          className={`${cellPadding} transition-all duration-200 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                        >
                          {col.render ? col.render(value, row) : (
                            <span className="font-body text-sm text-on-surface-variant">{String(value)}</span>
                          )}
                        </td>
                     );
                  })}
                </tr>
              ))}
              {currentData.length === 0 && (
                <tr>
                  <td colSpan={finalColumns.length} className="px-8 py-16 text-center text-outline font-body text-sm">
                    {searchTerm ? "No matching records found." : "No data available."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        {filteredAndSortedData.length > 0 && (
          <div className="px-8 py-5 bg-surface-container-low/30 border-t border-outline-variant/10 flex flex-col md:flex-row items-center gap-4 justify-between">
            <p className="font-body text-xs text-on-surface-variant whitespace-nowrap">
              Showing <span className="font-bold">{(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filteredAndSortedData.length)}</span> of {filteredAndSortedData.length} records
            </p>
            {totalPages > 1 && (
              <div className="w-full md:w-auto md:min-w-[300px]">
                <Pagination 
                   currentPage={currentPage}
                   totalPages={totalPages}
                   onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
