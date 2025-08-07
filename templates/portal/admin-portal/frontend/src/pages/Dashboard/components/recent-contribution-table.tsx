import { useQuery } from "@tanstack/react-query";
import { getContributions } from "@/services/contributions";
import { ContributionListColumns } from "@/components/table/columns/contribution-list-columns";
import DataTable from "@/components/table/data-table";
import TableSkeleton from "@/components/table/table-skeleton";
import { type Contribution } from "@/types/contribution";
import { contactFilters } from "@/components/table/data-table-filter-field";
import { useDataTableFilters } from "@/hooks/use-table-data-filters";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function RecentContributionsTable() {
  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useQuery<Contribution[], Error>({
    queryKey: ["contributions"],
    queryFn: getContributions,
  });

    const {
    filteredData: filteredData,
    filterFields,
    setFilters,
  } = useDataTableFilters(contactFilters, data);


  return (
    <Card className="mt-10">
      <CardHeader>
        <CardTitle className="text-sky-700">Recent Contributions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <p className="text-red-500">Error: {error?.message}</p>
        ) : (
          <DataTable
            columns={ContributionListColumns}
            data={filteredData}
            isLoading={isLoading}
            filterFields={filterFields} 
            onFilterChange={setFilters}
            previewMap={[
              { label: "Name", key: "contact.display_name" },
              { label: "Amount", key: "total_amount" },
              { label: "Date", key: "receive_date" },
            ]}
            exportFileName="Recent Contributions"
            basePath="contributions"            />
        )}
      </CardContent>
    </Card>
  );
}
