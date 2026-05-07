import SkeletonCard from "@/components/ui/SkeletonCard";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="h-8 w-36 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 animate-pulse">
          <div className="h-5 w-44 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div className={`bg-slate-200 dark:bg-slate-700 rounded ${i === 0 ? "h-72" : i === 1 ? "h-80" : "h-64"}`} />
        </div>
      ))}
    </div>
  );
}
