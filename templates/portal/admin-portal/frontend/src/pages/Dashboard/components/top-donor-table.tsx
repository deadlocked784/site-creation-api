import { useQuery } from "@tanstack/react-query";
import { type TopContribution } from "@/types/dashboard";
import { topDonationsColumns } from "@/pages/Dashboard/columns/top-contribution-columns";
import DataTable from "@/components/table/data-table";
import TableSkeleton from "@/components/table/table-skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TopDonorTableProps {
  queryKey: string;
  queryFn: () => Promise<TopContribution[]>;
  title: string;
  exportFileName: string;
}

export default function TopDonorTable({
  queryKey,
  queryFn,
  title,
  exportFileName,
}: TopDonorTableProps) {
  const { data: donors, isLoading, isError, error } = useQuery<TopContribution[], Error>({
    queryKey: [queryKey],
    queryFn,
  });


  // Ensure donors is an array before mapping
  const mappedDonors = Array.isArray(donors)
    ? donors.map((d) => ({
        contact_id: d.contact_id,
        contact_display_name: d["contact.display_name"],
        contact_contact_type: d["contact.contact_type"],
        total_donated: d.total_donated,
        latest_donation_date: d.latest_donation_date,
      }))
    : [];

  return (
    <Card className="mt-10">
      <CardHeader>
        <CardTitle className="text-sky-700">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <p className="text-red-500">{error?.message || "Error fetching donors"}</p>
        ) : !Array.isArray(donors) ? (
          <p className="text-red-500">Invalid data format received</p>
        ) : (
          <DataTable
            columns={topDonationsColumns}
            data={mappedDonors}
            exportFileName={exportFileName}
            previewMap={[
              { label: "Name", key: "contact_display_name" },
              { label: "Type", key: "contact_contact_type" },
              { label: "Total Donated", key: "total_donated" },
              { label: "Latest Donation", key: "latest_donation_date" },
            ]}
            basePath="contacts"
            isLoading={false}
          />
        )}
      </CardContent>
    </Card>
  );
}

