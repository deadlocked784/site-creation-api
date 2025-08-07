import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getContactTypeCounts } from "@/services/dashboard";

interface StatsCardProps {
  title: string;
  dataKey: "individual" | "organization";
}

export default function StatsCard({ title, dataKey }: StatsCardProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["contactTypeCounts"],
    queryFn: getContactTypeCounts,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return (
    <Card className="rounded-2xl shadow-md bg-gradient-to-t from-primary/5 to-card dark:from-muted/5 dark:to-card transition-shadow hover:shadow-lg bg-slate-100 h-[180px]">
      <CardHeader className="p-0 flex flex-col justify-center items-center h-full pointer-events-auto">
        <CardTitle className="text-2xl font-semibold text-slate-800 text-center p-3">
          {title}
        </CardTitle>
        <div className="text-3xl font-bold text-primary text-slate-700 text-center">
          {isLoading
            ? "Loading..."
            : isError
            ? "Failed to load"
            : data?.[dataKey] ?? 0}
        </div>
      </CardHeader>
    </Card>
  );
}
