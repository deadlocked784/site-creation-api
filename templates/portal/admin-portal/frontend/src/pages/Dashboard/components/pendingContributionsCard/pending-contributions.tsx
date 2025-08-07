
import { useQuery } from "@tanstack/react-query";
import { getAllActivities } from "@/services/activity";
import { activityByTypeListColumns } from "@/pages/Dashboard/columns/pending-contributions-columns";
import DataTable from "@/components/table/data-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Activity } from "@/types/activity";

export default function ScheduledActivitiesTable() {
  const {
    data: activities,
    isLoading,
    isError,
    error,
  } = useQuery<Activity[], Error>({
    queryKey: ["scheduledActivities"],
    queryFn: () => getAllActivities(),
  });

  const scheduledOnly = activities?.filter(
    (a) => a.status_id === 1
  ) ?? [];

  return (
    <Card className="mt-10">
      <CardHeader>
        <CardTitle className="text-sky-700">Pending Contributions</CardTitle>
      </CardHeader>
      <CardContent>
        {isError ? (
          <p className="text-red-500">
            {error?.message || "Error loading Pending Contributions."}
          </p>
        ) : (
          <DataTable
            columns={activityByTypeListColumns}
            data={scheduledOnly}
            isLoading={isLoading}
            showUpdateButton={true}
          />
        )}
      </CardContent>
    </Card>
  );
}

