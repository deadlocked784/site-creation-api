import { parseISO, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import React, { useState, useEffect, useMemo } from "react";
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type ColumnFiltersState,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { UpdateButtonWithIcon } from "./data-table-update-status";
import { BulkUpdateActivitiesDialog } from "@/pages/Dashboard/components/pendingContributionsCard/bulk-update-activities-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import TableSkeleton from "./table-skeleton";
import ExportWarningDialog from "../dialogs/export-warning-dialogue";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFilter } from "./data-table-filter";
import { DataTableComboboxSearch } from "./data-table-search";
import type { FilterField } from "@/types/filter";
import { exportToExcel } from "./data-table-export";
import type { Updater, RowSelectionState } from "@tanstack/react-table";

// Local utility to handle nested paths like "contact.nric"
function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  if (Object.prototype.hasOwnProperty.call(obj, path)) return obj[path];
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

// Utility to normalize search string: trim and replace multiple spaces with one space, lowercase
function normalizeSearchString(str: string) {
  return str.trim().replace(/\s+/g, " ").toLowerCase();
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
  filterFields?: FilterField[];
  onFilterChange?: (filters: Record<string, unknown>) => void;
  selectedRowIds?: RowSelectionState;
  onSelectedRowIdsChange?: (updaterOrValue: Updater<RowSelectionState>) => void;
  getRowId?: (row: TData) => string;
  exportFileName?: string;
  previewMap?: { label: string; key: string }[];
  basePath?: string;
  showUpdateButton?: boolean;
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  filterFields,
  onFilterChange,
  selectedRowIds,
  onSelectedRowIdsChange,
  getRowId,
  exportFileName = "table_data",
  previewMap = [],
  basePath = "contacts",
  showUpdateButton,
}: DataTableProps<TData, TValue>) {
  const [openDialog, setOpenDialog] = useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [internalRowSelection, setInternalRowSelection] = React.useState<Record<string, boolean>>({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [filterReady, setFilterReady] = useState(false);

  // For global search input debouncing
  const [searchInput, setSearchInput] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");

  const [showExportWarning, setShowExportWarning] = React.useState(false);
  const rowSelection = selectedRowIds ?? internalRowSelection;
  const selectedIds = Object.keys(rowSelection);

  // --- New: Start and end date for IRAS filtering
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setFilterReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Debounce the global filter input to update table filter with delay
  useEffect(() => {
    const handler = setTimeout(() => {
      setGlobalFilter(searchInput);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Filter data by date only if basePath === "iras"
const dataWithDateFilter = useMemo(() => {
  if (basePath !== "iras") return data;

  return data.filter((item: any) => {
    const dateStr = item.receive_date;
    if (!dateStr) return false;

    const recordDate = parseISO(dateStr);

    const start = startDate ? startOfDay(parseISO(startDate)) : null;
    const end = endDate ? endOfDay(parseISO(endDate)) : null;

    if (start && isBefore(recordDate, start)) return false;
    if (end && isAfter(recordDate, end)) return false;

    return true;
  });
}, [data, basePath, startDate, endDate]);
  // Normalize the search string in the fuzzyFilter for case- and space-insensitive matching
  const fuzzyFilter = React.useCallback(
    (row: any, _columnId: string, filterValue: string) => {
      const normalizedFilter = normalizeSearchString(filterValue);
      const rowData = row.original;

      return previewMap.some(({ key }) => {
        const value = getNestedValue(rowData, key);
        if (!value) return false;
        const normalizedValue = String(value).toLowerCase();
        // Also normalize spaces in the value for consistent matching
        const normalizedValueSpaces = normalizedValue.replace(/\s+/g, " ");
        return normalizedValueSpaces.includes(normalizedFilter);
      });
    },
    [previewMap]
  );

  const table = useReactTable({
    data: dataWithDateFilter,
    columns: columns.map((col) => ({ ...col, enableGlobalFilter: true })),
    getRowId,
    enableRowSelection: true,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: onSelectedRowIdsChange ?? setInternalRowSelection,
    autoResetPageIndex: false,
    state: {
      sorting,
      rowSelection: selectedRowIds ?? internalRowSelection,
      columnVisibility,
      columnFilters,
      globalFilter,
    },
  });

  const handleOpenDialog = () => {
    if (selectedIds.length > 0) {
      setOpenDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Reset page index on filter change
  React.useEffect(() => {
    table.setPageIndex(0);
  }, [globalFilter, startDate, endDate, table]);

  // Preview dropdown for top 5 results (normalize spaces here too)
  const previewRows = useMemo(() => {
    if (!globalFilter) return [];

    const normalizedFilter = normalizeSearchString(globalFilter);

    return dataWithDateFilter
      .filter((item) =>
        previewMap.some(({ key }) => {
          const value = getNestedValue(item, key);
          if (!value) return false;
          const normalizedValue = String(value).toLowerCase().replace(/\s+/g, " ");
          return normalizedValue.includes(normalizedFilter);
        })
      )
      .slice(0, 5)
      .map((original, index) => ({
        id: index,
        original,
      }));
  }, [globalFilter, dataWithDateFilter, previewMap]);

  const handleExportToExcel = () => {
    exportToExcel({
      table,
      exportFileName,
      onNoSelection: () => setShowExportWarning(true),
    });
  };

  const handleResetFilters = () => {
    setColumnFilters([]);
    table.setColumnFilters([]);
    setSearchInput("");
    setGlobalFilter("");
    setStartDate(null);
    setEndDate(null);
    onFilterChange?.({});
  };

  return (
    <div className="flex flex-col h-screen max-h-screen p-4 gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap items-center">
          {previewMap.length > 0 && (
            <DataTableComboboxSearch
              search={searchInput}
              setSearch={setSearchInput}
              previewMap={previewMap}
              basePath={basePath}
              previewRows={previewRows}
            />
          )}
          {filterReady ? (
            <DataTableFilter table={table} fields={filterFields} onChange={onFilterChange} />
          ) : (
            <Button variant="outline" size="sm" disabled>
              Loading Filter...
            </Button>
          )}

          {/* Start & End Date Pickers only for IRAS */}
          {basePath === "iras" && (
            <>
              <div className="flex flex-col">
                <label htmlFor="startDate" className="text-sm font-medium">
                  Start Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  className="border rounded px-2 py-1"
                  value={startDate ?? ""}
                  onChange={(e) => setStartDate(e.target.value || null)}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="endDate" className="text-sm font-medium">
                  End Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  className="border rounded px-2 py-1"
                  value={endDate ?? ""}
                  onChange={(e) => setEndDate(e.target.value || null)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="self-end"
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
              >
                Clear Dates
              </Button>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportToExcel}>
            Export to Excel
          </Button>
          <Button variant="outline" onClick={handleResetFilters}>
            Reset Filters
          </Button>
          <DataTableViewOptions table={table} />
          {showUpdateButton && (
            <UpdateButtonWithIcon
              onOpenDialog={handleOpenDialog}
              disabled={selectedIds.length === 0}
            />
          )}
        </div>
      </div>

      {/* Main Table Body */}
      <div className="overflow-hidden rounded-md border">
        <div className="w-full overflow-x-auto">
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <Table className="min-w-full">
              <TableHeader className="bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="whitespace-normal break-words">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() ? "selected" : undefined}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="whitespace-normal break-words align-top"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <DataTablePagination table={table} />
      <ExportWarningDialog open={showExportWarning} onOpenChange={setShowExportWarning} />
      <BulkUpdateActivitiesDialog table={table} open={openDialog} onClose={handleCloseDialog} />
    </div>
  );
}
