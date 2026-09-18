import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function StudentDashboardLoading() {
  return (
    <div className="space-y-4 sm:space-y-5 pb-8 w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      {/* Student Welcome Banner Skeleton */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-3.5 w-64 rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border border-slate-100 dark:border-white/5 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-3.5 space-y-2">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-7 w-16 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Student Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm p-4 space-y-3 bg-white dark:bg-slate-900">
            <Skeleton className="h-5 w-36 rounded" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-sm p-4 space-y-3 bg-white dark:bg-slate-900">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </Card>
        </div>
      </div>
    </div>
  );
}
