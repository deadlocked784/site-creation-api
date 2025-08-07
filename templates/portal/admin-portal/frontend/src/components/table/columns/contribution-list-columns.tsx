import { type ColumnDef } from "@tanstack/react-table"
import { type Contribution } from "@/types/contribution"
import { Checkbox } from "../../ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../ui/dropdown-menu"
import { Button } from "../../ui/button"
import { ChevronDown, ChevronsUpDown, ChevronUp, EllipsisVertical } from "lucide-react"
import { Link } from "react-router-dom"
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
    accessorFn: (row) => row["contact.display_name"],
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 hover:cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Receive Date
          {column.getIsSorted() === false ? <ChevronsUpDown className="text-gray-500" /> : column.getIsSorted() === "asc" ? <ChevronUp /> : <ChevronDown />}
        </Button>
      )
    },
    accessorFn: (row) => row.receive_date,
    cell: ({ row }) => {
      const date = new Date(row.original.receive_date);
      return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  },
  {
    id: "total_amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 hover:cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Amount
          {column.getIsSorted() === false ? <ChevronsUpDown className="text-gray-500" /> : column.getIsSorted() === "asc" ? <ChevronUp /> : <ChevronDown />}
        </Button>
      )
    },
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <EllipsisVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem asChild>
            <Link to={`/contributions/${row.original.id}`}>View</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={`/contributions/${row.original.id}/edit`}>Edit</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

