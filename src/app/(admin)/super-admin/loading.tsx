export default function SuperAdminLoading() {
  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto animate-pulse">
      {/* 1. Super Admin Page Header Skeleton (Rule 7.1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1.5">
          <div className="h-6 w-52 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-3.5 w-80 rounded-md bg-slate-100 dark:bg-slate-800/60" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 sm:h-9 w-32 rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      {/* 2. Metric / Stat Cards Grid Skeleton (Rule 7.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-3.5 rounded-xl border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between h-24"
          >
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-20 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="h-6 w-16 rounded-md bg-slate-200 dark:bg-slate-800" />
            <div className="h-2 w-24 rounded bg-slate-100 dark:bg-slate-800/60" />
          </div>
        ))}
      </div>

      {/* 3. Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-72 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between">
          <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-52 rounded-lg bg-slate-100/70 dark:bg-slate-800/40" />
        </div>
        <div className="h-72 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between">
          <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-52 rounded-lg bg-slate-100/70 dark:bg-slate-800/40" />
        </div>
      </div>
    </div>
  );
}
