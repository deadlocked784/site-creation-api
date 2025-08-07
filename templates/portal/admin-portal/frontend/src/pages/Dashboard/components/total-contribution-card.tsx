import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getContributions } from "@/services/contributions";

export default function TotalContributionCard() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["completedContributions"],
    queryFn: getContributions,
  });

  const completedContributions = data.filter(
  (item) => item.contribution_status_id === 1
);

  const totalAmount = completedContributions.reduce((sum, contribution) => {
    return sum + (contribution.total_amount || 0);
  }, 0);

  return (
   <Card className="rounded-2xl shadow-md bg-gradient-to-t from-primary/5 to-card dark:from-muted/5 dark:to-card transition-shadow hover:shadow-lg bg-slate-100 h-[180px]">
      <CardHeader className="p-0 flex flex-col justify-center items-center h-full pointer-events-auto">
        <CardTitle className="text-2xl font-semibold text-slate-800 text-center p-3">
          Total Contributions
        </CardTitle>
        <div className="text-3xl font-bold text-primary text-slate-700 text-center mt-4">
          {isLoading ? "Loading..." : '$' + totalAmount.toFixed(2)}
        </div>
      </CardHeader>
    </Card>
  );
}