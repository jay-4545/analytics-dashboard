"use client";
import { Search } from "lucide-react";

interface SelectOption { label: string; value: string }

interface FilterConfig {
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
}

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  right?: React.ReactNode;
}

export default function TableFilters({ search, onSearchChange, searchPlaceholder = "Search…", filters, right }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[var(--border)]">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Dropdowns */}
      {filters?.map((f) => (
        <select
          key={f.id}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">{f.placeholder}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ))}

      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  );
}
