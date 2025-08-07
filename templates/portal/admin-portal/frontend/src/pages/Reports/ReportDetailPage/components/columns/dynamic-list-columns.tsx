import type { ColumnDef } from "@tanstack/react-table";
import type { StatRow } from "@/types/reports";
import { Checkbox } from "@/components/ui/checkbox";

export const selectionColumn: ColumnDef<StatRow> = {
  id: "select",
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllPageRowsSelected()}
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
    />
  ),
  enableSorting: false,
  enableHiding: false,
};

export function getDynamicColumns(statsArray: StatRow[]): ColumnDef<StatRow>[] {
  if (!statsArray.length) return [];

  const otherColumns = Object.keys(statsArray[0])
    .filter((key) => key !== "id")
    .map((key) => ({
      header: key.charAt(0).toUpperCase() + key.slice(1),
      accessorKey: key,
      cell: ({ row }: { row: any }) => row.original[key],
    }));

  return [selectionColumn, ...otherColumns];
}
