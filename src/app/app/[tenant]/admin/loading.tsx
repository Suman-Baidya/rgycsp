export default function DashboardLoading() {
  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto animate-pulse">
      {/* 1. Page Header Skeleton (Rule 7.1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1.5">
          <div className="h-6 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-3.5 w-72 rounded-md bg-slate-100 dark:bg-slate-800/60" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 sm:h-9 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-8 sm:h-9 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
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
            <div className="h-2 w-28 rounded bg-slate-100 dark:bg-slate-800/60" />
          </div>
        ))}
      </div>

      {/* 3. Main Content Card & Toolbar Skeleton (Rule 7.4 & 7.5) */}
      <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden bg-white dark:bg-slate-900">
        {/* Toolbar Header Skeleton */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="h-8 sm:h-9 w-full sm:w-64 rounded-lg bg-slate-100 dark:bg-slate-800" />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="h-8 sm:h-9 w-28 rounded-lg bg-slate-100 dark:bg-slate-800" />
            <div className="h-8 sm:h-9 w-24 rounded-lg bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>

        {/* List Rows Skeleton */}
        <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex items-center justify-between p-3.5 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0" />
                <div className="space-y-1.5 min-w-0">
                  <div className="h-3.5 w-36 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-2.5 w-24 rounded bg-slate-100 dark:bg-slate-800/60" />
                </div>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-4 w-16 rounded-md bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800" />
                <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
