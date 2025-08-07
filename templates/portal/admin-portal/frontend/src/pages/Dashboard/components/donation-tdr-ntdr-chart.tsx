import { useQuery } from "@tanstack/react-query";
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useState, useMemo } from "react";

import { countContributionsByTdrNtdr } from "@/services/dashboard";
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
import { ContributionListColumns } from "@/components/table/columns/contribution-list-columns";
import { contributionFilters } from "@/components/table/data-table-filter-field";
import { useDataTableFilters } from "@/hooks/use-table-data-filters";
import { useClearFiltersOnDialogClose } from "@/hooks/use-dialog-filter-reset";

export default function ContributionsTdrNtdrChart() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["countContributionsByTdrNtdr", selectedYear],
    queryFn: () => countContributionsByTdrNtdr(selectedYear),
  });

  const modalData = useMemo(() => {
    if (selectedType === "Deductible") return data?.deductibleData ?? [];
    if (selectedType === "Non-Deductible") return data?.non_deductibleData ?? [];
    return [];
  }, [selectedType, data]);

  const {
    filteredData: filteredModalData,
    filterFields,
    setFilters,
  } = useDataTableFilters(contributionFilters, modalData);

  // Dialog open state
  const open = !!selectedType;

  // Clear filters when dialog closes
  useClearFiltersOnDialogClose(open, () => setFilters({}));

  const chartData = [
    {
      type: "Deductible",
      count: data?.deductibleData?.length ?? 0,
      donors: data?.deductibleData ?? [],
    },
    {
      type: "Non-Deductible",
      count: data?.non_deductibleData?.length ?? 0,
      donors: data?.non_deductibleData ?? [],
    },
  ].map((item, index) => ({
    ...item,
    fill: `var(--chart-${(index % 12) + 1})`,
  }));

  const chartConfig: ChartConfig = chartData.reduce((cfg, item) => {
    cfg[item.type] = {
      label: item.type,
      color: item.fill,
    };
    return cfg;
  }, {} as ChartConfig);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex items-center justify-between pb-0">
        <CardTitle className="m-0">
          Tax Deductible vs Non-Tax Deductible Donations
        </CardTitle>
        <YearDropdown selectedYear={selectedYear} onChange={setSelectedYear} />
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">Error loading data</div>
        ) : chartData.every((item) => item.count === 0) ? (
          <div className="text-center py-10 text-muted-foreground">No data</div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="count"
                    label
                    nameKey="type"
                    outerRadius={100}
                    fill="#8884d8"
                    onClick={(entry) => {
                      if (entry && typeof entry.type === "string") {
                        setSelectedType(entry.type);
                      }
                    }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltipContent hideLabel />} />
                  <Legend
                    payload={chartData.map((entry) => ({
                      value: entry.type,
                      type: "square",
                      color: entry.fill,
                      id: entry.type,
                    }))}
                    wrapperStyle={{ marginTop: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <Dialog
              open={open}
              onOpenChange={(isOpen) => {
                if (!isOpen) setSelectedType(null);
              }}
            >
              <DialogContent
                className="w-[80vw] max-w-none max-h-[80vh] flex flex-col overflow-hidden"
                style={{ maxWidth: "none", width: "80vw", maxHeight: "95vh" }}
              >
                <div className="overflow-y-auto flex-grow">
                  {isLoading ? (
                    <TableSkeleton />
                  ) : filteredModalData.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No data available
                    </div>
                  ) : (
                    <DataTable
                      columns={ContributionListColumns}
                      data={filteredModalData}
                      filterFields={filterFields}
                      onFilterChange={setFilters}
                      isLoading={false}
                      previewMap={[
                        { label: "Name", key: "contact.display_name" },
                        { label: "Email", key: "email.email" },
                        { label: "Amount", key: "total_amount" },
                        { label: "Phone", key: "phone.phone" },
                      ]}
                      exportFileName={`Contributions_${selectedType}`}
                      basePath="contributions"
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
