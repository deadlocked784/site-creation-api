import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useState } from "react";
import { getDonationAmtByCampaign } from "@/services/dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import DataTable from "@/components/table/data-table";
import TableSkeleton from "@/components/table/table-skeleton";
import YearDropdown from "./year-dropdown";
import { contributionFilters } from "@/components/table/data-table-filter-field";
import { useDataTableFilters } from "@/hooks/use-table-data-filters";
import { ContributionListColumns } from "@/components/table/columns/contribution-list-columns";
import { useClearFiltersOnDialogClose } from "@/hooks/use-dialog-filter-reset";

export default function DonationByCampaign() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["donationCampaignTotals", selectedYear],
    queryFn: () => getDonationAmtByCampaign(selectedYear),
  });

  const modalDonors =
    selectedCampaign && data
      ? data.find((d) => d.campaign === selectedCampaign)?.donors ?? []
      : [];

  const {
    filteredData: filteredModalDonors,
    filterFields,
    setFilters,
  } = useDataTableFilters(contributionFilters, modalDonors);

  const chartData =
    data?.map((item, index) => ({
      campaign: item.campaign,
      total: item.total,
      fill: `var(--chart-${(index % 12) + 1})`,
      donors: item.donors,
    })) ?? [];

  const chartConfig: ChartConfig = chartData.reduce((cfg, item, idx) => {
    cfg[item.campaign] = {
      label: item.campaign,
      color: `var(--chart-${(idx % 12) + 1})`,
    };
    return cfg;
  }, {} as ChartConfig);

    // Dialog open state
  const open = !!selectedCampaign;

  // Clear filters when dialog closes
  useClearFiltersOnDialogClose(open, () => setFilters({}));

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex items-center justify-between pb-0">
        <CardTitle className="m-0">Donation by Campaign</CardTitle>
        <YearDropdown selectedYear={selectedYear} onChange={setSelectedYear} />
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">Error loading data</div>
        ) : chartData.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">No data</div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="campaign" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent hideLabel />} />
                  <Bar
                    dataKey="total"
                    name="Total Donations"
                    onClick={(data) => setSelectedCampaign(data.campaign)}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                  <Legend
                    payload={chartData.map((entry) => ({
                      value: entry.campaign,
                      type: "square",
                      color: entry.fill,
                      id: entry.campaign,
                    }))}
                    wrapperStyle={{ marginTop: 12 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

     <Dialog
              open={open}
              onOpenChange={(isOpen) => {
                if (!isOpen) setSelectedCampaign(null);
              }}
            >
              <DialogContent
                className="w-[80vw] max-w-none max-h-[80vh] flex flex-col overflow-hidden"
                style={{ maxWidth: "none", width: "80vw", maxHeight: "95vh" }}
              >
                <div className="overflow-y-auto flex-grow">
                  {isLoading ? (
                    <TableSkeleton />
                  ) : (
                    <DataTable
                      columns={ContributionListColumns}
                      data={filteredModalDonors}
                      filterFields={filterFields}
                      onFilterChange={setFilters}
                      isLoading={false}
                      previewMap={[
                        { label: "Name", key: "contact.display_name" },
                        { label: "Email", key: "email.email" },
                        { label: "Amount", key: "total_amount" },
                        { label: "Phone", key: "phone.phone" }
                      ]}
                      exportFileName="Donation by Campaign" 
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
}