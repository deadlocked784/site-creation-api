
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { Activity } from "@/types/activity";
import { Link } from "react-router";
import ActivityCustomFields from "./activity-custom-fields";
import { useCustomFields } from "@/hooks/use-custom-fields";
import { format } from "date-fns";


const formatValue = (value: any): string =>
  value === null || value === undefined || value === "" ? "-" : value;

export default function ActivityDefault({ activity }: { activity: Activity }) {
  const customGroupName = activity["activity_type_id:name"]?.split(" ").join("_");
  const { data: customFields = [] } = useCustomFields(customGroupName);

  console.log("Volunteer schedule custom keys:", Object.keys(activity).filter(k => k.startsWith("Volunteer_Event_Schedule"))
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {activity["activity_type_id:name"]} Activity Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label>Added By</Label>
            <p>{formatValue(activity["source.display_name"])}</p>
          </div>
          <div>
            <Label>With</Label>
            {formatValue(activity["target.display_name"]) === "-" ? (
              <p>-</p>
            ) : (
              <Link to={`/contacts/${activity["target_contact_id"]}`}>
                <p className="text-blue-500 hover:text-inherit">
                  {formatValue(activity["target.display_name"])}
                </p>
              </Link>
            )}
          </div>
          <div>
            <Label>Assigned</Label>
            {formatValue(activity["assignee.display_name"]) === "-" ? (
              <p>-</p>
            ) : (
              <Link to={`/contacts/${activity["assignee_contact_id"]}`}>
                <p className="text-blue-500 hover:text-inherit">
                  {formatValue(activity["assignee.display_name"])}
                </p>
              </Link>
            )}
          </div>
          <div>
            <Label>Activity Type</Label>
            <p>{formatValue(activity["activity_type_id:name"])}</p>
          </div>
          <div>
            <Label>Subject</Label>
            <p>{formatValue(activity["subject"])}</p>
          </div>
          <div>
            <Label>Location</Label>
            <p>{formatValue(activity["location"])}</p>
          </div>
          <div>
            <Label>Date</Label>
            <p>
              {/* OLD CODE */}
              {/* {activity["activity_date_time"]
                ? (() => {
                  const date = new Date(activity["activity_date_time"]);
                  const day = date.getDate();
                  const month = date.toLocaleString("default", { month: "long" });
                  const year = date.getFullYear();
                  const time = date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return `${day} ${month}, ${year} ${time}`;
                })()
                : "-"} */}
                {activity["activity_date_time"] ? format(new Date(activity["activity_date_time"]), "dd/MM/yyyy, hh:mm a") : "-"}
            </p>
          </div>
          <div>
            <Label>Duration</Label>
            <p>{formatValue(activity["duration"])}</p>
          </div>
          <div>
            <Label>Activity Status</Label>
            <p>{formatValue(activity["status_id:name"])}</p>
          </div>
          <div>
            <Label>Details</Label>
            <p>{formatValue(activity["details"])}</p>
          </div>
          <ActivityCustomFields customGroupName={customGroupName} customFields={customFields} activity={activity as unknown as Record<string, unknown>} />
        </div>
      </CardContent>
    </Card>
  )
}