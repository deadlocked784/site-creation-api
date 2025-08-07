import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { Contribution } from "@/types/contribution";
import { Link } from "react-router";

export default function ContributionDefault({ contribution }: { contribution: Contribution }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Contribution Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label>From</Label>
            <Link to={`/contacts/${contribution.contact_id}`}>
              <p className="text-blue-500 hover:text-inherit">{contribution["contact.display_name"]}</p>
            </Link>
          </div>
          <div>
            <Label>Financial Type</Label>
            <p>{contribution["financial_type_id:label"]}</p>
          </div>
          <div>
            <Label>Total Amount</Label>
            <p>{`${contribution?.["currency:abbr"] ?? ""}${contribution?.total_amount ?? 0}`}</p>
          </div>

          <div>
            <Label>Payment Method</Label>
            <p>{contribution["payment_instrument_id:label"]}</p>
          </div>
          <div>
            <Label>Contribution Status</Label>
            <p>{contribution["contribution_status_id:label"]}</p>
          </div>
          <div>
            <Label>Contribution Date</Label>
            <p>{new Date(contribution.receive_date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) + " " + new Date(contribution.receive_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div>
            <Label>Contribution Source</Label>
            <p>{contribution.source}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}