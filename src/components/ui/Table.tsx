import { ReactNode } from 'react';

interface TableColumn<Row extends object> {
  key: string;
  label: string;
  render?: (row: Row) => ReactNode;
  className?: string;
}

interface TableProps<Row extends object> {
  columns: TableColumn<Row>[];
  data: Row[];
  emptyMessage?: string;
  rowKey?: string;
  onRowClick?: (row: Row) => void;
}

export default function Table<Row extends object>({ columns, data, emptyMessage = 'No data available', rowKey = 'id', onRowClick }: TableProps<Row>) {
  if (data.length === 0) {
    return (
      <div className="card p-8 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left font-semibold px-4 py-3 whitespace-nowrap ${col.className || ''}`}
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const values = row as Record<string, unknown>;
              return (
              <tr
                key={String(values[rowKey] ?? i)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`transition-colors ${onRowClick ? 'cursor-pointer' : ''} hover:bg-black/[0.02]`}
                style={{ borderBottom: i < data.length - 1 ? '1px solid var(--color-border)' : 'none' }}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 ${col.className || ''}`}>
                    {col.render ? col.render(row) : String(values[col.key] ?? '')}
                  </td>
                ))}
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
