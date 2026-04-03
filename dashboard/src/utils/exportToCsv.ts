export interface CsvColumn<T = any> {
  key: string;
  label: string;
  csvValue?: (value: any, row: T) => string;
}

export function exportToCsv<T extends Record<string, any>>(
  data: T[],
  columns: CsvColumn<T>[],
  filename: string
): void {
  const header = columns.map(col => `"${col.label}"`).join(',');
  const rows = data.map(row =>
    columns.map(col => {
      const val = row[col.key as keyof T];
      const str = col.csvValue
        ? col.csvValue(val, row)
        : (val === null || val === undefined ? '' : String(val));
      return `"${str.replace(/"/g, '""')}"`;
    }).join(',')
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
