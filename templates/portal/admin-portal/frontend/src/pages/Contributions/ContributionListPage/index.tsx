import { useQuery } from "@tanstack/react-query";
import { useDataTableFilters } from "@/hooks/use-table-data-filters";
import { getContributions } from "@/services/contributions";
import { contributionFilters } from "@/components/table/data-table-filter-field";
import DataTable from "@/components/table/data-table";
import { ContributionListColumns } from "./components/columns/contribution-list-columns";
import { useState } from "react";
import { NewContributionDialog } from "./components/new-contribution-dialog";
import { ActionButtons } from "./components/action-buttons";
import { Toaster } from "@/components/ui/sonner";

export default function ContributionListPage() {
  const [open, setOpen] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});

  const { data = [], isLoading } = useQuery({
    queryKey: ["contributions"],
    queryFn: getContributions,
  });

  const {
    setFilters,
    filterFields,
    filteredData,
  } = useDataTableFilters(contributionFilters, data);

  const selectedRows = filteredData.filter((row) => selectedRowIds[String(row.id)]);

  return (
    <div className="container mx-auto py-5 px-4">
      <div className="flex justify-end items-center gap-2 mb-4">
        <NewContributionDialog open={open} onOpenChange={setOpen} />
        <ActionButtons selectedRows={selectedRows} />
      </div>

      <Toaster position="top-center" richColors />

      <DataTable
        columns={ContributionListColumns}
        data={filteredData}
        isLoading={isLoading}
        filterFields={filterFields}
        onFilterChange={setFilters}
        selectedRowIds={selectedRowIds}
        onSelectedRowIdsChange={setSelectedRowIds}
        getRowId={(row) => String(row.id)}
        previewMap={[
          { label: "Name", key: "contact.display_name" },
          { label: "Amount", key: "total_amount" },
          { label: "Date", key: "receive_date" },
          { label: "Email", key: "email.email" },
          { label: "Phone", key: "phone.phone" },
        ]}
        exportFileName="Contributions"
        basePath="contributions"
      />
    </div>
  )

}