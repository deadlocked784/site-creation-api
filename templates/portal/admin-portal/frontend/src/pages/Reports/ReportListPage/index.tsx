import { useQuery } from "@tanstack/react-query";
import { getReports, getSearchKitReports } from "@/services/reports";
import { ReportCard } from "./components/report-badge";
import { ReportCardSkeletonGroup } from "./components/report-skeleton"; 
import { DataTableComboboxSearch } from "@/components/table/data-table-search";
import { useState } from "react";

type ReportCardProps = React.ComponentProps<typeof ReportCard>;
type GroupedReports = Record<string, ReportCardProps[]>;

export default function ReportListView() {
  const {
    data: reports = [],
    isLoading: loadingReports,
    error: errorReports,
  } = useQuery({ queryKey: ["reports"], queryFn: getReports });

  const {
    data: searchKits = [],
    isLoading: loadingSearchKits,
    error: errorSearchKits,
  } = useQuery({ queryKey: ["searchkits"], queryFn: getSearchKitReports });

  const [search, setSearch] = useState("");

  // Use skeleton during loading
  if (loadingReports || loadingSearchKits) {
    return (
      <div className="pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <ReportCardSkeletonGroup /> 
        <ReportCardSkeletonGroup />
      </div>
    );
  }

  if (errorReports || errorSearchKits) {
    return <div className="text-red-500">Error loading reports.</div>;
  }

  // Combine both datasets into one
  const combinedReports = [
    ...reports.map((item: any) => ({
      id: item.id,
      title: item.title,
      subtitle: item.description,
      createdBy: item.created_id ? `User ${item.created_id}` : "System",
      category:
        item.report_id?.split("/")?.[0]?.replace(/^\w/, (c: string) => c.toUpperCase()) || "General",
      //  link: `view/${item.id}?type=reportInstance`, //production
         link: `/reports/${item.id}`, //localhost
    })),
    ...searchKits.map((item: any) => ({
      id: item.id,
      title: item.label,
      subtitle: item.description,
      createdBy: item.created_id ? `User ${item.created_id}` : "System",
      category: "SearchKit",
      // link: `view/${item.id}?type=searchKit`, //production
      link: `/reports/searchkit/${item.id}/?type=searchKit`, //localhost
    })),
  ];

  // Filter reports by search input
  const filteredReports = search
    ? combinedReports.filter(
        (report) =>
          report.title.toLowerCase().includes(search.toLowerCase()) ||
          (report.subtitle && report.subtitle.toLowerCase().includes(search.toLowerCase()))
      )
    : combinedReports;

  // Group by category
  const groupedReports = filteredReports.reduce((acc: GroupedReports, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Search input */}
      <DataTableComboboxSearch
        search={search}
        setSearch={setSearch}
        previewMap={[
          { label: "Title", key: "title" },
          { label: "Description", key: "subtitle" },
          { label: "Created By", key: "createdBy" },
        ]}
        basePath="reports"
        previewRows={filteredReports}
      />

      {/* Grouped Reports Display */}
      {Object.entries(groupedReports).map(([category, cards]) => (
        <div
          key={category}
          className="border border-muted rounded-2xl p-6 bg-muted/10 shadow-sm mb-6"
        >
          <h2 className="text-xl font-bold text-primary mb-4">{category} Reports</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, index) => (
              <ReportCard key={index} {...card} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
