import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { getReportById } from "@/services/reports";
import DataTable from "@/components/table/data-table";
import { Toaster } from "@/components/ui/sonner";
import type { StatRow } from "@/types/reports";

import { getDynamicColumns } from "./components/columns/dynamic-list-columns";

export default function ReportHtmlViewer() {
  const { id = "" } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["systemReport", id],
    queryFn: () => getReportById(parseInt(id)),
    enabled: !!id,
  });

  const statsArray: StatRow[] = useMemo(() => {
    const stats = data?.stats ?? {};
    return Object.entries(stats).map(([key, value]) => ({
      id: key,
      ...(typeof value === "object" && value !== null ? value : { value }),
    }));
  }, [data]);

  const dynamicColumns = useMemo(() => getDynamicColumns(statsArray), [statsArray]);

  return (
    <div className="container mx-auto py-5 px-4">
      <h2 className="text-xl font-bold mb-4">
        {data?.title}
      </h2>
      <Toaster position="top-center" richColors />
      <DataTable
        columns={dynamicColumns}
        data={statsArray}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        exportFileName="Report_Statistics"
        basePath="reports"
      />
    </div>
  );
}
