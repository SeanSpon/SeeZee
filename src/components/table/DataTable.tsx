"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  header: ReactNode;
  key: keyof T | string;
  className?: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[] | null | undefined;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, data, emptyMessage = "No data available" }: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg p-12 text-center text-slate-400 text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:-mx-5 px-4 sm:px-5" style={{ position: 'relative', WebkitOverflowScrolling: 'touch' }}>
      <table className="w-full" style={{ minWidth: 'max-content' }}>
        <thead>
          <tr className="border-b border-white/[0.06]">
            {columns.map((column, index) => (
              <th
                key={index}
                className={clsx(
                  "px-2 sm:px-3 py-3 text-left text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500 whitespace-nowrap",
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {data.map((row, rowIndex) => {
            // Use row id if available, otherwise use index
            const rowKey = (row as any)?.id ?? rowIndex;
            return (
              <tr key={rowKey} className="hover:bg-white/[0.02] transition-colors relative">
                {columns.map((column, colIndex) => {
                  const cellKey = `${rowKey}-${colIndex}-${String(column.key)}`;
                  const isLastColumn = colIndex === columns.length - 1;
                  return (
                    <td 
                      key={cellKey} 
                      className={clsx(
                        "px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-slate-300 whitespace-nowrap", 
                        column.className,
                        isLastColumn && "relative"
                      )}
                      style={isLastColumn ? { overflow: 'visible' } : undefined}
                    >
                      {column.render
                        ? column.render(row)
                        : (() => {
                            const key = column.key;
                            if (typeof key === "string" && key in (row as Record<string, unknown>)) {
                              return (row as Record<string, unknown>)[key] as ReactNode;
                            }
                            return null;
                          })()}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;







