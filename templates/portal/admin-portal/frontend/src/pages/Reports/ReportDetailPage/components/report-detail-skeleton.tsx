import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportDetailSkeletonProps {
  columnCount?: number;
  rowCount?: number;
}

export default function ReportDetailSkeleton({ columnCount = 4, rowCount = 5 }: ReportDetailSkeletonProps) {
  const columns = Array.from({ length: columnCount });
  const rows = Array.from({ length: rowCount });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-8 w-1/3 bg-gray-200 rounded" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-full border border-gray-200 rounded">
            <div className="flex bg-gray-100">
              {columns.map((_, colIndex) => (
                <div
                  key={`header-${colIndex}`}
                  className="flex-1 px-4 py-2 border-r border-gray-200"
                >
                  <Skeleton className="h-4 w-3/4 bg-gray-300" />
                </div>
              ))}
            </div>
            {rows.map((_, rowIndex) => (
              <div key={`row-${rowIndex}`} className="flex border-t border-gray-100">
                {columns.map((_, colIndex) => (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="flex-1 px-4 py-3 border-r border-gray-100"
                  >
                    <Skeleton className="h-4 w-full bg-gray-200" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
