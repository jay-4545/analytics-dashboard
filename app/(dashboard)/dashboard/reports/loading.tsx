export default function ReportsLoading() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="h-8 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 animate-pulse space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
