export default function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="h-12 border-b border-[var(--border)] px-4 flex items-center gap-4 animate-pulse">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 border-b border-[var(--border)] last:border-0 px-4 flex items-center gap-4 animate-pulse">
          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0" />
          {Array.from({ length: cols - 1 }).map((_, j) => (
            <div key={j} className="h-4 bg-slate-200 dark:bg-slate-700 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
