import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { Table } from "@tanstack/react-table";

interface ExportToExcelProps<TData> {
  table: Table<TData>;
  exportFileName?: string;
  onNoSelection?: () => void;
}

export function exportToExcel<TData>({
  table,
  exportFileName = "table_data",
  onNoSelection,
}: ExportToExcelProps<TData>) {
  const selectedRows = table.getSelectedRowModel().rows;

  if (selectedRows.length === 0) {
    onNoSelection?.();
    return;
  }

  const visibleCols = table.getAllColumns().filter((col) => col.getIsVisible());

  const exportData = selectedRows.map((row) => {
    const rowData: Record<string, any> = {};
    visibleCols.forEach((col) => {
      const header = col.columnDef.header;
      const headerLabel = typeof header === "string" ? header : col.id;
      rowData[headerLabel] =
        row.getValue(col.id) ?? (row.original as Record<string, any>)[col.id] ?? "";
    });
    return rowData;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const file = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(file, `${exportFileName}.xlsx`);
}
