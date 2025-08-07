import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

import DataTable from "@/components/table/data-table"; // your data table component
import { ContributionListColumns } from "@/components/table/columns/contribution-list-columns"; // your columns config
import { getContributions } from "@/services/contributions";
import { getContacts } from "@/services/contacts";
import { BarChartIcon } from "lucide-react";
import type { Contribution } from "@/types/contribution";


export default function MonthlyContributionsSummary() {
    const { data: allContributions = [], isLoading: loadingContributions } = useQuery<Contribution[]>({
        queryKey: ["contributions"],
        queryFn: getContributions,
    });

    const { data: contacts = [], isLoading: loadingContacts } = useQuery({
        queryKey: ["contacts"],
        queryFn: () => getContacts({}),
    });

    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

    // Aggregate contributions by month and contribution type
    const aggregatedData = useMemo(() => {
        // Filter contributions by selectedYear
        const filtered = allContributions.filter(
            (c) => c.receive_date && c.receive_date.startsWith(selectedYear)
        );

        // Map: { month: { contributionType: totalAmount } }
        const map: Record<string, Record<string, number>> = {};

        filtered.forEach((c) => {
            if (!c.receive_date) return;
            const [year, month] = c.receive_date.split("-");

            const monthKey = `${year}-${month}`;
            const contributionType = c["financial_type_id:label"] || "Unknown";

            if (!map[monthKey]) {
                map[monthKey] = {};
            }
            if (!map[monthKey][contributionType]) {
                map[monthKey][contributionType] = 0;
            }
            map[monthKey][contributionType] += c.total_amount;
        });

        // Convert map to array for chart, with keys for each contribution type
        const allTypes = Array.from(
            new Set(allContributions.map((c) => c["financial_type_id:label"] || "Unknown"))
        );

        const result = Object.entries(map)
            .map(([monthKey, types]) => {
                const [year, month] = monthKey.split("-");
                const date = new Date(Number(year), Number(month) - 1);
                const monthLabel = date.toLocaleString("en-US", { month: "short" }).toUpperCase();

                // total for this month (all types)
                const total = Object.values(types).reduce((a, b) => a + b, 0);

                // Build an object with all types as keys (with 0 if none)
                const typesWithZero: Record<string, number> = {};
                allTypes.forEach((type) => {
                    typesWithZero[type] = types[type] || 0;
                });

                return {
                    month: monthKey,
                    monthLabel,
                    total,
                    ...typesWithZero,
                };
            })
            // Sort by month ascending
            .sort((a, b) => (a.month > b.month ? 1 : -1));

        return { data: result, allTypes };
    }, [allContributions, selectedYear]);

    const handleBarClick = (data: any) => {
        if (data && data.month) {
            setSelectedMonth(data.month);
            setDialogOpen(true);
        }
    };

    // Filter contributions for selected month in dialog
    const filteredContributions = selectedMonth
        ? allContributions.filter((c) => c.receive_date?.startsWith(selectedMonth))
        : [];

    // Map contacts to quickly lookup names by contact_id
    const contactMap = useMemo(() => {
        const map: Record<number, string> = {};
        contacts.forEach((ct: any) => {
            const name = ct.first_name || ct.last_name ? `${ct.first_name || ""} ${ct.last_name || ""}`.trim() : "Anonymous";
            map[ct.id] = name;
        });
        return map;
    }, [contacts]);

    const contributionsWithNames = filteredContributions.map((c) => ({
        ...c,
        contributorName: contactMap[c.contact_id] || c["contact.display_name"] || "Anonymous",
    }));

    if (loadingContributions || loadingContacts) return <p>Loading...</p>;

    return (
        <div className="rounded-xl shadow bg-card px-6 py-8 w-full min-h-[520px]">
            <div className="mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-sky-700">
                    <BarChartIcon className="w-5 h-5" />
                    Monthly Contributions Summary
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                    This bar chart shows total donation amounts by month. Click on a bar to view detailed contributions.
                </p>
            </div>

            <div className="mb-4 flex justify-end">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from(new Set(allContributions.map((c) => c.receive_date?.split("-")[0]))).map((year) => (
                            <SelectItem key={year} value={year || ""}>
                                {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={aggregatedData.data} onClick={(e) => handleBarClick(e?.activePayload?.[0]?.payload)} barCategoryGap={20}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="monthLabel" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]} />
                    <Legend />
                    {aggregatedData.allTypes.map((type, i) => (
                        <Bar
                            key={type}
                            dataKey={type}
                            stackId="a"
                            fill="#0ea5e9"
                            name={type}
                            radius={i === 0 ? [4, 4, 0, 0] : undefined}
                            barSize={40}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>

            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent
                    className="max-w-4xl max-h-[80vh] overflow-y-auto overflow-x-hidden"
                >
                    <DialogHeader>
                        <DialogTitle>Contributions for {selectedMonth}</DialogTitle>
                        <DialogDescription>
                            List of contributors and their contribution amounts for {selectedMonth}.
                        </DialogDescription>
                    </DialogHeader>

                    {contributionsWithNames.length === 0 ? (
                        <p className="text-slate-600 mt-4">No contributions found for this month.</p>
                    ) : (
                        <div className="mt-4 w-full overflow-x-auto">
                           
                            <DataTable
                                columns={ContributionListColumns}
                                data={contributionsWithNames}
                                isLoading={false}
                                previewMap={[
                                    { label: "Contributor", key: "contributorName" },
                                    { label: "Amount", key: "total_amount" },
                                    { label: "Date", key: "receive_date" },
                                ]}
                                exportFileName={`Contributions_${selectedMonth}`}
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




