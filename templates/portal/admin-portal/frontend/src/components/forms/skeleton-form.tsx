import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

export default function SkeletonForm() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <Skeleton className="h-8 bg-gray-200 rounded mb-2" />
                    <Skeleton className="h-10 bg-gray-200 rounded mb-4" />
                </div>
                <div >
                    <Skeleton className="h-8 bg-gray-200 rounded mb-2" />
                    <Skeleton className="h-10 bg-gray-200 rounded mb-4" />
                </div>
            </div>
            <div>
                <Skeleton className="h-8 bg-gray-200 rounded mb-2" />
                <Skeleton className="h-10 bg-gray-200 rounded mb-4" />
            </div>
            <Button type="submit" className="w-full">Save</Button>
        </div>
    );
}