"use client";

import React from "react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export default function DataTable<T>({
  columns,
  data,
  emptyMessage = "No data found",
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-border-default bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-default bg-neutral-50">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-sm text-text-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={index}
                  onClick={
                    onRowClick
                      ? () => onRowClick(row)
                      : undefined
                  }
                  className={`border-b border-border-default last:border-0 ${
                    onRowClick
                      ? "cursor-pointer hover:bg-neutral-50"
                      : ""
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-4 py-3 text-sm text-text-body"
                    >
                      {column.render
                        ? column.render(row)
                        : String(
                            row[
                              column.key as keyof T
                            ] ?? ""
                          )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}