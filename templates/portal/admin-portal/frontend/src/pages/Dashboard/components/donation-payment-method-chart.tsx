import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PieChart, Pie, Cell, Legend } from "recharts"
import { getDonationCountByPaymentMethod } from "@/services/dashboard"
import YearDropdown from "./year-dropdown"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import DataTable from "@/components/table/data-table"
import TableSkeleton from "@/components/table/table-skeleton"
import { ContributionListColumns } from "@/components/table/columns/contribution-list-columns";
import { contributionFilters } from "@/components/table/data-table-filter-field";
import { useDataTableFilters } from "@/hooks/use-table-data-filters";
import { useClearFiltersOnDialogClose } from "@/hooks/use-dialog-filter-reset";

export default function DonationByPaymentMethod() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

  const { data: chartData, isLoading, error } = useQuery({
    queryKey: ["donationPaymentMethod", selectedYear],
    queryFn: () => getDonationCountByPaymentMethod(selectedYear),
  })

  const COLORS = ["#3b82f6", "#94a3b8", "#f97316", "#10b981", "#ef4444"]

  const chartConfig =
    chartData && chartData.length > 0
      ? chartData.reduce((config, item, index) => {
        config[item.method] = {
          label: item.method,
          color: COLORS[index % COLORS.length],
        }
        return config
      }, {} as Record<string, { label: string; color: string }>)
      : {}

  const modalTableData =
    selectedMethod && chartData
      ? chartData.find((entry) => entry.method === selectedMethod)?.donors ?? []
      : []

  const {
    filteredData: filteredModalTableData,
    filterFields,
    setFilters,
  } = useDataTableFilters(contributionFilters, modalTableData);

  // Dialog open state
  const open = !!selectedMethod;

  // Clear filters when dialog closes
  useClearFiltersOnDialogClose(open, () => setFilters({}));

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="flex items-center justify-between pb-0">
          <CardTitle className="m-0">Donation Count by Payment Method</CardTitle>
          <YearDropdown selectedYear={selectedYear} onChange={setSelectedYear} />
        </CardHeader>

        <CardContent className="flex-1 pb-0">
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">Loading...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">Error loading data</div>
          ) : !chartData || chartData.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No data</div>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square min-h-[250px] max-w-[300px] w-full"
            >
              <PieChart width={300} height={340}>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  formatter={(value) => chartConfig[value]?.label || value}
                />
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="method"
                  label
                  innerRadius={60} 
                  outerRadius={100}
                  cx="50%"
                  cy="50%"
                  cursor="pointer"
                  onClick={(entry) => setSelectedMethod(entry.method)}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}

                </Pie>
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedMethod}
        onOpenChange={(open) => {
          if (!open) setSelectedMethod(null)
        }}
      >
        <DialogContent
          className="w-[80vw] max-w-none max-h-[80vh] flex flex-col overflow-hidden"
          style={{ maxWidth: "none", width: "80vw", maxHeight: "95vh" }}
        >
          <div className="overflow-y-auto flex-grow">
            {isLoading ? (
              <TableSkeleton />
            ) : error ? (
              <div className="text-center text-red-500 py-10">Error loading details</div>
            ) : filteredModalTableData.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No detailed data</div>
            ) : (
              <DataTable
                columns={ContributionListColumns}
                data={filteredModalTableData}
                isLoading={false}
                filterFields={filterFields} 
                onFilterChange={setFilters}
                exportFileName={`Donation_Count_by_Payment_Method_${selectedYear}`}
                basePath="contributions"
                previewMap={[
                  { label: "Name", key: "contact.display_name" },
                  { label: "Email", key: "email.email" },
                  { label: "Amount", key: "total_amount" },
                  { label: "Phone", key: "phone.phone" }
                ]}

              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
