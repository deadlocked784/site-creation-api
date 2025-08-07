import { type ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

export interface TopContribution {
  contact_id: number;
  contact_display_name: string;
  contact_contact_type: string;
  total_donated: number;
  latest_donation_date: string;
}

export const topDonationsColumns: ColumnDef<TopContribution>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
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
  {
    id: "name",
    header: "Name",
    accessorFn: (row) => row.contact_display_name,
    cell: ({ row }) => {
      const contactId = row.original.contact_id;
      const displayName = row.original.contact_display_name ?? "-";
      return contactId ? (
        <Link to={`/contacts/${contactId}`}>
          <div className="text-blue-500 hover:underline">{displayName}</div>
        </Link>
      ) : (
        displayName
      );
    },
  },
  {
    id: "type",
    header: "Type",
    accessorFn: (row) => row.contact_contact_type,
    cell: ({ row }) => row.original.contact_contact_type || "-",
  },
  {
    id: "total_donated",
    header: "Total Donated",
    accessorFn: (row) => row.total_donated,
    cell: ({ row }) =>
      typeof row.original.total_donated === "number"
        ? `$${row.original.total_donated.toFixed(2)}`
        : "-",
  },
  {
    id: "latest_donation_date",
    header: "Latest Donation Date",
    accessorFn: (row) => row.latest_donation_date,
    cell: ({ row }) =>
      row.original.latest_donation_date
        ? new Date(row.original.latest_donation_date).toLocaleDateString()
        : "-",
  },
];
