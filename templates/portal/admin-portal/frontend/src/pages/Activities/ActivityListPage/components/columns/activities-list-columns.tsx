import { type ColumnDef } from "@tanstack/react-table";
import { type Activity } from "@/types/activity"; 
import { Checkbox } from "@/components/ui/checkbox";
import { ActionsCell } from "@/components/common/actions-cell";
import { deleteActivity, updateActivity } from "@/services/activity"
import { Link } from "react-router-dom";
import ActivityForm from "@/pages/Activities/components/activity-form";
import { format } from 'date-fns'

const formatValue = (value: any): string =>
  value === null || value === undefined || value === "" ? "-" : value;

export const activityListColumns: ColumnDef<Activity>[] = [
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
    id: "type",
    header: "Type",
    accessorKey: formatValue("activity_type_id:name"),
    cell: ({ getValue }) => {
      const activityTypeName = getValue<string>();
      return activityTypeName;
    },
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
        <div>{formatValue(row.original["source.display_name"])}</div>
    )
  },
  {
    id: "withContact",
    header: "With",
    accessorFn: (row) => formatValue(row["target.display_name"]),
    cell: ({ row }) => {
      const display = formatValue(row.original["target.display_name"]);
      const contactId = row.original["target_contact_id"];
      return display === "-" ? (
        <span>-</span>
      ) : (
        <Link to={`/contacts/${contactId}`}>
          <div className="text-blue-500 hover:text-inherit">{display}</div>
        </Link>
      );
    },
  },
  {
    id: "assignedContact",
    header: "Assigned",
    accessorFn: (row) => formatValue(row["assignee.display_name"]),
    cell: ({ row }) => {
      const display = formatValue(row.original["assignee.display_name"]);
      const contactId = row.original["assignee_contact_id"];
      return display === "-" ? (
        <span>-</span>
      ) : (
        <Link to={`/contacts/${contactId}`}>
          <div className="text-blue-500 hover:text-inherit">{display}</div>
        </Link>
      );
    },
  },
  // CIVICRM DEFAULT DATE TIME FORMAT
  // {
  //   id: "date",
  //   header: "Date",
  //   accessorFn: (row) => {
  //     if (!row.activity_date_time) return "-";
  
  //     const date = new Date(row.activity_date_time);
  
  //     const day = date.getDate();
  //     const month = date.toLocaleString("default", { month: "long" });
  //     const year = date.getFullYear();
  //     const time = date.toLocaleTimeString([], {
  //       hour: "2-digit",
  //       minute: "2-digit",
  //     });
  
  //     return `${day} ${month}, ${year} ${time}`;
  //   },
  // },   

  // ALTERED DATE FORMAT DD/MM/YYYY, HH:MM A
  {
    id: "date",
    header: "Date",
    accessorFn: (row) => {
      if (!row.activity_date_time) return "-";
      return format(new Date(row.activity_date_time), "dd/MM/yyyy, hh:mm a");
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
