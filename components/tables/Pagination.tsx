"use client";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, totalCount, limit, onPageChange }: Props) {
  const from = Math.min((page - 1) * limit + 1, totalCount);
  const to   = Math.min(page * limit, totalCount);

  const btn = (disabled: boolean, onClick: () => void, children: React.ReactNode) => (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors",
        disabled
          ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
          : "text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[var(--foreground)]"
      )}
    >
      {children}
    </button>
  );

  const pages = (() => {
    const delta = 2;
    const range: (number | "…")[] = [];
    const start = Math.max(2, page - delta);
    const end   = Math.min(totalPages - 1, page + delta);

    range.push(1);
    if (start > 2) range.push("…");
    for (let i = start; i <= end; i++) range.push(i);
    if (end < totalPages - 1) range.push("…");
    if (totalPages > 1) range.push(totalPages);
    return range;
  })();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-t border-[var(--border)]">
      <p className="text-sm text-[var(--muted)]">
        Showing <span className="font-medium text-[var(--foreground)]">{from}–{to}</span> of{" "}
        <span className="font-medium text-[var(--foreground)]">{totalCount}</span>
      </p>
      <div className="flex items-center gap-1">
        {btn(page === 1, () => onPageChange(1), <ChevronsLeft className="w-4 h-4" />)}
        {btn(page === 1, () => onPageChange(page - 1), <ChevronLeft className="w-4 h-4" />)}
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-[var(--muted)] text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
                p === page
                  ? "bg-indigo-600 text-white"
                  : "text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {p}
            </button>
          )
        )}
        {btn(page === totalPages, () => onPageChange(page + 1), <ChevronRight className="w-4 h-4" />)}
        {btn(page === totalPages, () => onPageChange(totalPages), <ChevronsRight className="w-4 h-4" />)}
      </div>
    </div>
  );
}
