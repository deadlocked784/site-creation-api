import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContactSummarySkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-8">
                    <Skeleton className="size-24 rounded-full" />
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-3">
                            <CardTitle><Skeleton className="h-6 w-18 rounded-sm" /></CardTitle>
                            <CardDescription>
                                <Skeleton className="h-4 w-52 rounded-sm" />
                            </CardDescription>
                        </div>
                        <CardDescription className="flex flex-col gap-3">
                            <Skeleton className="h-3 w-44 rounded-sm" />
                            <Skeleton className="h-3 w-24 rounded-sm" />
                            <Skeleton className="h-3 w-34 rounded-sm" />
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
}