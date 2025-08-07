import { type ColumnDef } from "@tanstack/react-table";
import { type IrasTransaction } from "@/types/iras"; 
import { Checkbox } from "../../../../components/ui/checkbox";
import { Link } from "react-router-dom";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";

export const IrasTransactionColumns: ColumnDef<IrasTransaction>[] = [
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
    id: "receipt_no",
    header:"Receipt ID",
    accessorFn: (row) => row.receipt_no ?? "",
  },
  {
    id: "receive_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Transaction Date" />,
    accessorFn: (row) => row.receive_date ?? "",
    cell: ({ row }) => {
      if (!row.original.receive_date) return "";
      const date = new Date(row.original.receive_date);
      return (
        date.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "numeric" }) +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    },
  },
  {
    id: "total_amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Transaction Amount" />,
    // accessorFn: (row) => (row.total_amount && row["currency:abbr"]) ? row["currency:abbr"] + row.total_amount.toFixed(2) : "",
    accessorFn: (row) =>
  row.total_amount != null
    ? (row["currency:abbr"] ?? "") + Number(row.total_amount).toFixed(2)
    : "",

  },
  {
    id: "contact_id",
    header: "Contact ID" ,
    accessorFn: (row) => row.contact_id ?? "",
  },
  {
    id: "contact_name",
    header:"Contact Name",
    cell: ({ row }) => (
      <Link to={`/contacts/${row.original.contact_id}`}>
        <div className="text-blue-500 hover:text-inherit">
          {row.original.sort_name ?? ""}
        </div>
      </Link>
    ),
  },
  {
    id: "nricuen",
    header:"Contact NRIC/UEN" ,
    accessorFn: (row) => row.nricuen ?? "",
  },
  {
    id: "donation_created_date",
    header:"Sent Date",
    accessorFn: (row) => row.donation_created_date ?? "",
    cell: ({ row }) => {
      if (!row.original.donation_created_date) return "";
      const date = new Date(row.original.donation_created_date);
      return (
        date.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "numeric" }) +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    },
  },
  {
    id: "sent_method",
    header:"Sent Method",
    accessorFn: (row) => row.sent_method ?? "",
  },
  {
    id: "sent_response",
    header: "Sent Response",
    accessorFn: (row) => row.sent_response ?? "",
  },
  {
    id: "response_body",
    header: "Sent Message",
    accessorFn: (row) => row.response_body ?? "",
    cell: ({ row }) => (
      <pre className="whitespace-pre-wrap max-w-xs overflow-x-auto text-xs">
        {row.original.response_body ?? ""}
      </pre>
    ),
  },
];
