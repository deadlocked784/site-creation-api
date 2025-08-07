import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Chart from "react-apexcharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getContributions } from "@/services/contributions";
import { saveTargetAmount, getTargetAmount } from "@/services/dashboard";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function TargetDonationAmount() {
  const queryClient = useQueryClient();

  const {
    data: savedTargetAmountData,
    isLoading: loadingTarget,
    isError: errorTarget,
  } = useQuery({
    queryKey: ["targetAmount"],
    queryFn: getTargetAmount,
  });

  const [targetAmount, setTargetAmount] = useState<number | "">("");

  useEffect(() => {
    if (typeof savedTargetAmountData === "number") {
      setTargetAmount(savedTargetAmountData);
    }
  }, [savedTargetAmountData]);

  const { mutate: saveAmount, isPending: saving } = useMutation({
    mutationFn: saveTargetAmount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["targetAmount"] });
    },
  });

  const debouncedTargetAmount = useDebounce(targetAmount, 3000);

  useEffect(() => {
    if (typeof debouncedTargetAmount === "number" && debouncedTargetAmount > 0) {
      saveAmount(debouncedTargetAmount);
    }
  }, [debouncedTargetAmount, saveAmount]);

  const handleTargetChange = (val: string) => {
    const numVal = val === "" ? "" : Number(val);
    setTargetAmount(numVal);
  };

  const {
    data,
    isLoading: loadingDonations,
    isError: errorDonations,
  } = useQuery({
    queryKey: ["donor"],
    queryFn: getContributions,
  });

  const currentYear = new Date().getFullYear();

  const totalDonation = (data ?? [])
    .filter((contribution) => {
      const contributionYear = new Date(contribution.receive_date).getFullYear();
      return contributionYear === currentYear;
    })
    .reduce((sum, contribution) => sum + (contribution.total_amount || 0), 0);

  const validTarget =
    typeof targetAmount === "number" && targetAmount > 0 ? targetAmount : null;

  const percentage = validTarget
    ? Math.min((totalDonation / validTarget) * 100, 100)
    : 0;

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "radialBar",
      offsetY: -20,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: { background: "#e0e7ff" },
        hollow: { size: "60%" },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "20px",
            color: "#2563eb",
            fontWeight: "bold",
            offsetY: 10,
            show: true,
            formatter: (val) => `${Math.round(val)}%`,
          },
        },
      },
    },
    fill: { colors: ["#3b82f6"] },
    labels: ["Progress"],
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-center font-semibold">
          {currentYear} Target Donation Amount
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-4 pt-0">
        <div>
          <label htmlFor="targetAmount" className="block text-sm font-medium mb-1">
            Set Target Amount ($)
          </label>
          <input
            type="number"
            id="targetAmount"
            min={1}
            value={targetAmount}
            onChange={(e) => handleTargetChange(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Enter target amount"
            disabled={saving || loadingTarget}
          />
          {errorTarget && (
            <p className="text-red-500 text-sm mt-1">Failed to load target amount.</p>
          )}
        </div>

        <div className="flex justify-center">
          {validTarget ? (
            <Chart
              key={percentage}
              options={chartOptions}
              series={[percentage]}
              type="radialBar"
              height={200}
            />
          ) : loadingTarget ? (
            <p className="text-center text-muted-foreground">Loading chart...</p>
          ) : (
            <p className="text-center text-muted-foreground">No target amount set</p>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {loadingDonations || loadingTarget
            ? "Loading..."
            : errorDonations || errorTarget
            ? "Error fetching donation data"
            : validTarget
            ? `$${totalDonation.toLocaleString()} raised of $${validTarget.toLocaleString()}`
            : "No target amount set"}
        </p>
      </CardContent>
    </Card>
  );
}

