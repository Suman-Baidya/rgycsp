export default function StudentLoading() {
  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto animate-pulse">
      {/* 1. Header Skeleton */}
      <div className="h-24 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="h-5 w-40 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-60 rounded-md bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
        <div className="hidden sm:flex gap-2">
          <div className="h-9 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-9 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      {/* 2. Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/50 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="h-2.5 w-20 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-7 w-16 rounded-md bg-slate-200 dark:bg-slate-800" />
            <div className="h-2.5 w-28 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>

      {/* 3. Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-72 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/50 p-4 space-y-3">
          <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-full rounded-lg bg-slate-200/50 dark:bg-slate-800/40" />
        </div>
        <div className="h-72 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/50 p-4 space-y-3">
          <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2 pt-2">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-10 rounded-lg bg-slate-200/60 dark:bg-slate-800/50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
