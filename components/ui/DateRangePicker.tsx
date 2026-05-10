"use client";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import { CalendarDays, ChevronDown } from "lucide-react";
import "react-day-picker/style.css";

interface Props {
  range: DateRange;
  onChange: (range: DateRange) => void;
}

export default function DateRangePicker({ range, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const label =
    range.from && range.to
      ? `${format(range.from, "MMM d")} – ${format(range.to, "MMM d, yyyy")}`
      : range.from
      ? `${format(range.from, "MMM d, yyyy")} – …`
      : "Select range";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--foreground)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
      >
        <CalendarDays className="w-4 h-4 text-[var(--muted)]" />
        <span>{label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)]" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-xl p-3 max-w-[calc(100vw-2rem)]">
          <style>{`
            .rdp { --rdp-accent-color: #6366f1; --rdp-accent-background-color: #e0e7ff; }
            .dark .rdp { --rdp-accent-background-color: #312e81; }
            .rdp-day { border-radius: 6px; }
          `}</style>
          <DayPicker
            mode="range"
            selected={range}
            onSelect={(r) => { if (r) { onChange(r); if (r.from && r.to) setOpen(false); } }}
            numberOfMonths={1}
          />
        </div>
      )}
    </div>
  );
}
