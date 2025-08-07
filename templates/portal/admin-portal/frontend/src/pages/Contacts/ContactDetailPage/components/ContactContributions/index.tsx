import DataTable from "@/components/table/data-table";
import { getContactContributions } from "@/services/contacts";
import { useQuery } from "@tanstack/react-query";
import { ContactContributionsColumns } from "./components/columns/contact-contributions-columns";
import { NewContributionDialog } from "@/pages/Contributions/ContributionListPage/components/new-contribution-dialog";
import { ActionButtons } from "@/pages/Contributions/ContributionListPage/components/action-buttons";
import { useState } from "react";
import { contributionFilters } from "@/components/table/data-table-filter-field";
import { useDataTableFilters } from "@/hooks/use-table-data-filters";

interface ContactContributionsProps {
  contactId: string;
  contactName?: string;
}

export default function ContactContributions(props: ContactContributionsProps) {
  const [open, setOpen] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});

    const { data = [], error, isLoading } = useQuery({
    queryKey: ["contact", "contributions", props.contactId],
    queryFn: () => getContactContributions(props.contactId),
    enabled: !!props.contactId,
  });
    const {
      setFilters,
      filterFields,
      filteredData,
    } = useDataTableFilters(contributionFilters, data);

      const selectedRows = filteredData.filter((row) => selectedRowIds[String(row.id)]);
    

  if (error) return <div>Error loading contributions</div>;

  const columns = ContactContributionsColumns(props.contactId);

  return (
    <div>
       <div className="flex items-center justify-end mb-4 space-x-4 -mt-12 z-10 relative">
        <NewContributionDialog open={open} onOpenChange={setOpen} contactId={parseInt(props.contactId)} contactName={props.contactName} />
            <ActionButtons selectedRows={selectedRows} />
      </div>
      <DataTable columns={columns} data={filteredData} isLoading={isLoading} filterFields={filterFields} getRowId={(row) => String(row.id)}
        onFilterChange={setFilters} selectedRowIds={selectedRowIds}
        onSelectedRowIdsChange={setSelectedRowIds} />
    </div>
  )
}