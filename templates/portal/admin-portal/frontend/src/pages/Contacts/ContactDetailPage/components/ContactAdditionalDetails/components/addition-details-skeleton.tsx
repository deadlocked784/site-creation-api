// components/skeletons/contact-additional-info-skeleton.tsx
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContactAdditionalInfoSkeleton() {
  return (
    <div className="space-y-4">
      {/* Fake dropdown button */}
      <div className="flex justify-end">
        <Skeleton className="w-40 h-10 rounded-md" />
      </div>

      {/* Fake widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5 shadow-sm border border-gray-200 space-y-4">
            <Skeleton className="w-32 h-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j}>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
