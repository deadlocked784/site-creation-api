import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

// Helper to format fallback labels
function formatLabel(field: string): string {
  const asMatch = field.match(/AS\s+([^\s]+)/i);
  let label = asMatch ? asMatch[1] : field;

  label = label.replace(/.*\./, ""); 
  label = label
    .replace(/GROUP_CONCAT_/i, "")
    .replace(/GROUP_FIRST_/i, "")
    .replace(/SUM_/i, "")
    .replace(/COUNT_/i, "")
    .replace(/MIN_/i, "")
    .replace(/MAX_/i, "")
    .replace(/_0\d\b/g, "") // remove trailing _01, _02
    .replace(/_/g, " ")
    .replace(/\b(\w+)\s+\1\b/gi, "$1"); // remove duplicate words

  return label
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isDateArrayField(field: string) {
  return field.startsWith("GROUP_CONCAT") && field.toLowerCase().includes("receive_date");
}

function isAmountField(field: string) {
  const lower = field.toLowerCase();
  return lower.includes("amount") || lower.includes("total_amount");
}

function isCountField(field: string) {
  return field.toLowerCase().startsWith("count(");
}

export function generateSearchKitColumns(
  selectFields: string[] = [],
  rows: any[] = [],
  labelOverrides: Record<string, string> = {}
): ColumnDef<any>[] {
  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const effectiveFields =
    selectFields.length > 0 ? selectFields : rows?.[0] ? Object.keys(rows[0]) : [];

  for (const field of effectiveFields) {
    let accessorKey = field;
    const asMatch = field.match(/AS\s+([^\s]+)/i);
    if (asMatch) accessorKey = asMatch[1];

    const label = labelOverrides[accessorKey] || formatLabel(field);

    let cell: ColumnDef<any>["cell"] = ({ getValue }) => getValue() ?? "-";

    if (isDateArrayField(field)) {
      cell = ({ row }) => {
        const raw = row.original[accessorKey];
        if (!Array.isArray(raw)) return "-";
        return raw
          .map((d: string) => {
            const date = new Date(d);
            return isNaN(date.getTime()) ? "" : format(date, "yyyy-MM-dd");
          })
          .join(", ") || "-";
      };
    } else if (isAmountField(field)) {
      cell = ({ getValue }) => {
        const val = getValue();
        if (val == null || val === "") return "-";
        return `$${Number(val).toFixed(2)}`;
      };
    } else if (
      field.toLowerCase().includes("receive_date") &&
      !isCountField(field)
    ) {
      cell = ({ getValue }) => {
        const val = getValue();
        const date = new Date(val as string | number | Date);
        return isNaN(date.getTime()) ? val : format(date, "yyyy-MM-dd HH:mm");
      };
    }

    // Special rendering for sort_name → link to detail page
    if (accessorKey === "sort_name") {
      cell = ({ row }) => {
        const displayName = row.original[accessorKey];
        const contactId = row.original["id"];
        if (!contactId) return displayName ?? "-";
        return (
          <Link to={`/contacts/${contactId}`}>
            <div className="text-blue-500 hover:text-inherit">{displayName}</div>
          </Link>
        );
      };
    }

    columns.push({
      id: accessorKey,
      accessorFn: (row) => row?.[accessorKey] ?? "-",
      header: label,
      cell,
    });
  }

  return columns;
}
