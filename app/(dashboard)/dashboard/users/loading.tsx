import SkeletonTable from "@/components/ui/SkeletonTable";

export default function UsersLoading() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="h-14 border-b border-[var(--border)] px-4 flex items-center gap-3 animate-pulse">
          <div className="h-9 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
        <SkeletonTable rows={10} cols={9} />
      </div>
    </div>
  );
}
