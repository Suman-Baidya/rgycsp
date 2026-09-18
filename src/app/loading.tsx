import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="w-full min-h-[60vh] max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Hero Skeleton */}
      <div className="space-y-4 text-center max-w-2xl mx-auto py-12">
        <Skeleton className="h-6 w-32 mx-auto rounded-full" />
        <Skeleton className="h-10 sm:h-12 w-3/4 mx-auto rounded-xl" />
        <Skeleton className="h-4 w-full max-w-md mx-auto rounded-lg" />
        <div className="flex justify-center gap-3 pt-4">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Grid Showcase Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-5 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
