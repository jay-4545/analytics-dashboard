"use client";
import {
  useReactTable, getCoreRowModel, getSortedRowModel, flexRender,
  type ColumnDef, type SortingState, type RowSelectionState,
} from "@tanstack/react-table";
import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const ROW: Variants = {
  hidden:  { opacity: 0, y: 6 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.2, delay: i * 0.04, ease: "easeOut" as const },
  }),
};

interface Props<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (state: RowSelectionState) => void;
  getRowId?: (row: T) => string;
  emptyMessage?: string;
  emptyNode?: React.ReactNode;
}

export default function DataTable<T>({
  data, columns, onRowClick, rowSelection, onRowSelectionChange,
  getRowId, emptyMessage = "No data found.", emptyNode,
}: Props<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data, columns,
    state: { sorting, rowSelection: rowSelection ?? {} },
    onSortingChange: setSorting,
    onRowSelectionChange: onRowSelectionChange
      ? (updater) => {
          const next = typeof updater === "function" ? updater(rowSelection ?? {}) : updater;
          onRowSelectionChange(next);
        }
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId,
    enableRowSelection: !!onRowSelectionChange,
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-[var(--border)]">
              {hg.headers.map((header) => (
                <th key={header.id}
                  className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide whitespace-nowrap">
                  {header.isPlaceholder ? null : (
                    <div
                      className={cn("flex items-center gap-1",
                        header.column.getCanSort() && "cursor-pointer select-none hover:text-[var(--foreground)] transition-colors")}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        header.column.getIsSorted() === "asc"  ? <ChevronUp className="w-3.5 h-3.5" /> :
                        header.column.getIsSorted() === "desc" ? <ChevronDown className="w-3.5 h-3.5" /> :
                        <ChevronsUpDown className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                {emptyNode ?? (
                  <p className="px-4 py-12 text-center text-[var(--muted)]">{emptyMessage}</p>
                )}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <motion.tr
                key={row.id}
                custom={i}
                variants={ROW}
                initial="hidden"
                animate="visible"
                onClick={() => onRowClick?.(row.original)}
                className={cn(
                  "border-b border-[var(--border)] last:border-0 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50",
                  row.getIsSelected() && "bg-indigo-50/50 dark:bg-indigo-950/20",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 whitespace-nowrap text-[var(--foreground)]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
