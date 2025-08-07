import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/table/data-table";
import { ContributionListColumns } from "@/components/table/columns/contribution-list-columns";

import { getYearlyDonationsByType } from "@/services/dashboard";
import { getContacts } from "@/services/contacts";

import type { YearlyDonationsByType } from "@/types/dashboard";

export default function YearlyDonationChangeWidget() {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const { data = [], isLoading, isError, error } = useQuery<YearlyDonationsByType[], Error>({
    queryKey: ["yearly-donations-by-type"],
    queryFn: getYearlyDonationsByType,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts"],
    queryFn: () => getContacts({}),
  });

  const chartData = useMemo(() => {
    return data.map((item, index) => {
      const prev = data[index - 1];
      const individualChange =
        index > 0 && prev?.Individual !== 0
          ? ((item.Individual - prev.Individual) / prev.Individual) * 100
          : 0;
      const organizationChange =
        index > 0 && prev?.Organization !== 0
          ? ((item.Organization - prev.Organization) / prev.Organization) * 100
          : 0;

      return {
        ...item,
        individualChange: Number(individualChange.toFixed(2)),
        organizationChange: Number(organizationChange.toFixed(2)),
      };
    });
  }, [data]);

  const handleBarClick = (entry: any) => {
    if (entry && entry.year) {
      setSelectedYear(entry.year.toString());
      setDialogOpen(true);
    }
  };

  const contactMap = useMemo(() => {
    const map: Record<number, string> = {};
    contacts.forEach((ct: any) => {
      const name = ct.first_name || ct.last_name ? `${ct.first_name || ""} ${ct.last_name || ""}`.trim() : "Anonymous";
      map[ct.id] = name;
    });
    return map;
  }, [contacts]);

  const selectedYearData = chartData.find((d) => d.year.toString() === selectedYear);
  const contributionsWithNames =
    selectedYearData?.contributions?.map((c: any) => ({
      ...c,
      // match column config structure
      "contact.display_name": contactMap[c.contact_id] || c.contact_display_name || "Anonymous",
      "financial_type_id:label": c.financial_type || "",
      "contribution_status_id:label": c.status || "",
      "currency:abbr": "SGD", // set your default currency here
      source: c.source || "", // optional fallback
    })) ?? [];

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;
  if (!chartData.length) return <div>No data available</div>;

  return (
    <div className="rounded-xl shadow bg-card px-6 py-8 w-full min-h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-sky-700">Yearly Donation Change</h2>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          onClick={(e) => handleBarClick(e?.activePayload?.[0]?.payload)}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={(v) => `$${v.toLocaleString()}`} />
          <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
          <Legend />
          <Bar dataKey="Individual" fill="#4caf50" name="Individual Donations" />
          <Bar dataKey="Organization" fill="#2196f3" name="Organization Donations" />
        </BarChart>
      </ResponsiveContainer>

      {/* Contribution dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>Contributions for {selectedYear}</DialogTitle>
            <DialogDescription>
              List of contributors and their contribution amounts in {selectedYear}.
            </DialogDescription>
          </DialogHeader>

          {contributionsWithNames.length === 0 ? (
            <p className="text-slate-600 mt-4">No contributions found for this year.</p>
          ) : (
            <div className="mt-4 w-full overflow-x-auto">
              <DataTable
                columns={ContributionListColumns}
                data={contributionsWithNames}
                isLoading={false}
                previewMap={[
                  { label: "Contributor", key: "contact.display_name" },
                  { label: "Amount", key: "total_amount" },
                  { label: "Date", key: "receive_date" },
                ]}
                exportFileName={`Contributions_${selectedYear}`}
                basePath="contributions"
              />
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


