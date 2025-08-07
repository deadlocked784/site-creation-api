import { Skeleton } from "@/components/ui/skeleton";

export function ReportCardSkeleton() {
  return (
    <div className="border rounded-2xl p-5 shadow-sm bg-white dark:bg-muted/30 space-y-4">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-muted rounded-full">
          <Skeleton className="w-5 h-5 rounded-full" />
        </div>
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-4 w-16 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
          </div>
        </div>
      </div>
      <Skeleton className="h-8 w-24 rounded-md" />
    </div>
  );
}

export function ReportCardSkeletonGroup({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-40 bg-muted rounded-md" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <ReportCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
