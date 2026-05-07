import SkeletonCard from "@/components/ui/SkeletonCard";
import SkeletonTable from "@/components/ui/SkeletonTable";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 animate-pulse">
            <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 animate-pulse">
            <div className="h-5 w-36 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
            <div className="h-56 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5">
            <div className="h-5 w-44 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
            <SkeletonTable rows={5} cols={4} />
          </div>
        ))}
      </div>
    </div>
  );
}
