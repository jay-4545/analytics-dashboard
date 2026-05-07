"use client";
import { useState, useRef, useEffect } from "react";
import { Download, FileText, Table2 } from "lucide-react";

interface Props {
  onExportPDF: () => void;
  onExportExcel: () => void;
  loading?: boolean;
}

export default function ExportButton({ onExportPDF, onExportExcel, loading }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--foreground)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-xl py-1.5 z-50">
          <button
            onClick={() => { onExportPDF(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FileText className="w-4 h-4 text-red-500" />
            Download PDF
          </button>
          <button
            onClick={() => { onExportExcel(); setOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[var(--foreground)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Table2 className="w-4 h-4 text-green-500" />
            Download Excel
          </button>
        </div>
      )}
    </div>
  );
}
