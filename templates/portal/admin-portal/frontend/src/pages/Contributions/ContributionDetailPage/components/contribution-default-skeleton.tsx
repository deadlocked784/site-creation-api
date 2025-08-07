import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";


export default function ContributionDefaultSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-10 bg-gray-200 rounded mb-4" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Skeleton className="h-8 bg-gray-200 rounded mb-2" />
            <Skeleton className="h-10 bg-gray-200 rounded mb-4" />
          </div>
          <div>
            <Skeleton className="h-8 bg-gray-200 rounded mb-2" />
            <Skeleton className="h-10 bg-gray-200 rounded mb-4" />
          </div>
          <div>
            <Skeleton className="h-8 bg-gray-200 rounded mb-2" />
            <Skeleton className="h-10 bg-gray-200 rounded mb-4" />
          </div>
          <div>
            <Skeleton className="h-8 bg-gray-200 rounded mb-2" />
            <Skeleton className="h-10 bg-gray-200 rounded mb-4" />
          </div>
          <div>
            <Skeleton className="h-8 bg-gray-200 rounded mb-2" />
            <Skeleton className="h-10 bg-gray-200 rounded mb-4" />
          </div>
          <div>
            <Skeleton className="h-8 bg-gray-200 rounded mb-2" />
            <Skeleton className="h-10 bg-gray-200 rounded mb-4" />
          </div>
        </div>
      </CardContent>
    </Card>

  )
}