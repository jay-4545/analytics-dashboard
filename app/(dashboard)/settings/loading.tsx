export default function SettingsLoading() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="h-8 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="flex border-b border-[var(--border)]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-1 h-12 flex items-center justify-center">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="p-6 space-y-5 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
