import { type ColumnDef } from "@tanstack/react-table"
import { type Contribution } from "@/types/contribution"
import { Checkbox } from "../../../../../components/ui/checkbox"
import { Link } from "react-router-dom"
import { ActionsCell } from "@/components/common/actions-cell"
import ContributionForm from "@/pages/Contributions/components/forms/contribution-form"
import { deleteContribution, updateContribution } from "@/services/contributions"
import { DataTableColumnHeader } from "@/components/table/data-table-column-header"
export const ContributionListColumns: ColumnDef<Contribution>[] = [
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
    id: "contact",
    header: "Contact",
    cell: ({ row }) => (
      <Link to={`/contacts/${row.original.contact_id}`} >
        <div className="text-blue-500 hover:text-inherit">{row.original["contact.display_name"] ? row.original["contact.display_name"] : ''}</div>
      </Link>
    ),
  },
  {
    id: "type",
    header: "Type",
    accessorFn: (row) => row["financial_type_id:label"],

  },
  {
    id: "source",
    header: "Source",
    accessorFn: (row) => row.source ? row.source : "",
  },
  {
    id: "receive_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Receive Date" />,
    accessorFn: (row) => row.receive_date,
    cell: ({ row }) => {
      const date = new Date(row.original.receive_date);
      return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  },
  {
    id: "total_amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total Amount" />,
    accessorFn: (row) => (row.total_amount && row["currency:abbr"]) ? row["currency:abbr"] + row.total_amount.toFixed(2) : "",
  },
  {
    id: "status",
    header: "Status",
    accessorFn: (row) => row["contribution_status_id:label"],
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionsCell<Contribution>
        row={row}
        type={'contribution'}
        queryKey={['contributions']}
        EditForm={ContributionForm}
        updateFn={updateContribution}
        deleteFn={deleteContribution}
      />
    ),
  },
]