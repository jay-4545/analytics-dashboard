export default function SkeletonCard() {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-7 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
      <div className="h-3.5 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
    </div>
  );
}
