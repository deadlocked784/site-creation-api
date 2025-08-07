import { type ColumnDef } from "@tanstack/react-table";
import { type Activity } from "@/types/activity"; 
import { Checkbox } from "@/components/ui/checkbox";
import { ActionsCell } from "@/components/common/actions-cell";
import { deleteActivity, updateActivity } from "@/services/activity"
import { Link } from "react-router-dom";
import ActivityForm from "@/pages/Activities/components/activity-form";

const formatValue = (value: any): string =>
  value === null || value === undefined || value === "" ? "-" : value;

export const activityByTypeListColumns: ColumnDef<Activity>[] = [
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
    id: "subject",
    header: "Subject",
    accessorKey: formatValue("subject"),
  },
  {
    id: "addedBy",
    header: "Added By",
    accessorFn: (row) => formatValue(row["source.display_name"]),
    cell: ({ row }) => (
        <Link to={`/contacts/${row.original['source_contact_id']}`} >
          <div>{formatValue(row.original["source.display_name"])}</div>
        </Link>
    )
  },
  {
    id: "date",
    header: "Date",
    accessorFn: (row) => {
      if (!row.activity_date_time) return "-";
  
      const date = new Date(row.activity_date_time);
  
      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();
      const time = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
  
      return `${day} ${month}, ${year} ${time}`;
    },
  },   
  {
    id: "Total Amount",
    header: "Total Amount",
    accessorFn: row => {
      const amt = formatValue(row["Pending_Contribution.Total_Amount"]);
      return `$${amt}`;
    },
  },
  {
    id: "status",
    header: "Status",
    accessorKey: formatValue("status_id:name"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <ActionsCell<Activity>
          row={row}
          type="activity"
          queryKey={["contact", "activities"]}
          deleteFn={deleteActivity}
          updateFn={updateActivity}
          EditForm={ActivityForm}
        />
      );
    },
  },
];
