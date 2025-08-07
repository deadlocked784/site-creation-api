import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";

import DataTable from "@/components/table/data-table";
import { DataTableComboboxSearch } from "@/components/table/data-table-search";
import { getReportRowsByInstanceId } from "@/services/reports";
import { generateSearchKitColumns } from "../columns/searchkit-columns";

export default function ReportDetailsPage() {
  const { id = "" } = useParams();
  const numericId = Number(id);
  const [search, setSearch] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["searchkit", numericId],
    queryFn: async () => {
      const result = await getReportRowsByInstanceId(numericId);
      return {
        meta: {
          name: result.name,
          label: result.label,
          api_params: result.api_params ?? {},
          labelOverrides: result.labelOverrides ?? {},
          title: result.title, 
        },
        rows: result.rows,
      };
    },
  });

  const report = data?.meta;
  const rows = data?.rows ?? [];

  const previewMap = [
    { label: "Name", key: "sort_name" },
    { label: "Contact Type", key: "contact_type:label" },
  ];

  const columns = useMemo(() => {
    const selectFields = report?.api_params?.select ?? [];
    const labelOverrides = report?.labelOverrides ?? {};
    return generateSearchKitColumns(selectFields, rows, labelOverrides);
  }, [rows, report]);

  const filteredRows = useMemo(() => {
    if (!search) return rows;
    const lower = search.toLowerCase();
    return rows.filter((row: any) =>
      previewMap.some((field) => {
        const value = getNestedValue(row, field.key);
        return value && String(value).toLowerCase().includes(lower);
      })
    );
  }, [search, rows]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 text-red-600">
        Failed to load report.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {report?.label ?? report?.title ?? "Report"}
        </h1>
        <DataTableComboboxSearch
          search={search}
          setSearch={setSearch}
          previewMap={previewMap}
          basePath="reports"
          previewRows={filteredRows}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredRows}
        isLoading={isLoading}
        exportFileName={report?.label ?? "Report"}
      />
    </div>
  );
}

function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
}
