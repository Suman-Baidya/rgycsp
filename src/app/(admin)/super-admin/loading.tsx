import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function SuperAdminLoading() {
  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full mx-auto animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <Skeleton className="h-6 sm:h-7 w-52 rounded-lg" />
          <Skeleton className="h-3.5 w-72 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 sm:h-9 w-28 rounded-lg" />
          <Skeleton className="h-8 sm:h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Metric Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-3.5 flex items-center justify-between">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-2.5 w-24 rounded" />
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
              <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Card Skeleton */}
      <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <Skeleton className="h-8 sm:h-9 w-72 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-8 sm:h-9 w-28 rounded-lg" />
            <Skeleton className="h-8 sm:h-9 w-24 rounded-lg" />
          </div>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-800/50 p-1">
          {[1, 2, 3, 4, 5, 6, 7].map((row) => (
            <div key={row} className="flex items-center justify-between p-3 sm:p-3.5 gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-44 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-20 rounded" />
                <Skeleton className="h-7 w-7 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
