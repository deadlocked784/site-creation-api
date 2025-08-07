import { useState } from "react"
import { PieChart, Pie, Cell, Legend } from "recharts"
import { useQuery } from "@tanstack/react-query"
import { countDonorsByRecurringStatus } from "@/services/dashboard"
import YearDropdown from "./year-dropdown"
import { contributionFilters } from "@/components/table/data-table-filter-field";
import { useDataTableFilters } from "@/hooks/use-table-data-filters";
import { useClearFiltersOnDialogClose } from "@/hooks/use-dialog-filter-reset";
import DataTable from "@/components/table/data-table"
import { ContributionListColumns } from "@/components/table/columns/contribution-list-columns";
import TableSkeleton from "@/components/table/table-skeleton"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"

export default function RecurringOneTimeDonation() {

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ["donorCounts", selectedYear],
    queryFn: () => countDonorsByRecurringStatus(selectedYear),

  })

  const chartData =
    data && !isLoading && !error
      ? [
        { type: "Recurring", count: data.recurring, fill: "#3b82f6" },
        { type: "One-Time", count: data.oneTime, fill: "#94a3b8" },
      ]
      : []

  const chartConfig = {
    Recurring: { label: "Recurring Donors", color: "var(--chart-1)" },
    "One-Time": { label: "One-Time Donors", color: "var(--chart-2)" },
  }

  const modalTableData =
    selectedType === "Recurring" && data?.recurringData
      ? data.recurringData
      : selectedType === "One-Time" && data?.oneTimeData
        ? data.oneTimeData
        : []


  const {
    filteredData: filteredModalData,
    filterFields,
    setFilters,
  } = useDataTableFilters(contributionFilters, modalTableData);

  // Dialog open state
  const open = !!selectedType;

  // Clear filters when dialog closes
  useClearFiltersOnDialogClose(open, () => setFilters({}));

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="flex items-center justify-between pb-0">
          <CardTitle className="m-0">One Time vs Recurring Donation</CardTitle>
          <YearDropdown selectedYear={selectedYear} onChange={setSelectedYear} />
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          {isLoading ? (
            <div className="text-center py-10">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">Error loading data</div>
          ) : data?.recurring === 0 && data?.oneTime === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No data</div>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square min-h-[250px] max-w-[300px] w-full"
            >
              <PieChart width={300} height={350}>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  formatter={(value) =>
                    chartConfig[value as keyof typeof chartConfig]?.label || value
                  }
                />
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="type"
                  label
                  cursor="pointer"
                  onClick={(entry) => setSelectedType(entry.type)}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
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
            ) : (
               <DataTable
                          columns={ContributionListColumns}
                          data={filteredModalData}
                          filterFields={filterFields} 
                          onFilterChange={setFilters}
                          isLoading={false}
                          exportFileName="Recurring vs One-Time Donors"
                        />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
