// frontend/src/pages/Iras/IrasOnlineReportPage/index.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

import DataTable from "@/components/table/data-table";
import {
  getConfigurations,
  getIrasTransactions,
  generateAndSendReport,
} from "@/services/iras";
import { useDataTableFilters } from "@/hooks/use-table-data-filters";
import { irasTransactionFilters } from "@/components/table/data-table-filter-field";
import { IrasTransactionColumns } from "./columns/iras-transaction-columns";

export default function IrasOnlineReportPage() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});
  const [isAmendment, setIsAmendment] = useState(false);
  const [includePrevious, setIncludePrevious] = useState(false);

  const {
    data: configData,
    isLoading: isConfigLoading,
    isError: isConfigError,
  } = useQuery({
    queryKey: ["configurationsData"],
    queryFn: getConfigurations,
  });

  const validateOnly =
    configData && typeof configData.validate_only !== "undefined"
      ? String(configData.validate_only) === "1"
      : undefined;

  useEffect(() => {
    if (validateOnly === false) {
      setIsRedirecting(true);
      const basePath = window.location.pathname.startsWith("/admin-portal")
        ? "/admin-portal"
        : "";
      const redirectUrl = `${basePath}/api/iras/login-url`;
      window.location.href = redirectUrl;
    } else {
      setIsRedirecting(false);
    }
  }, [validateOnly]);

  const {
    data: irasTransactions = [],
    isLoading: isTransactionsLoading,
  } = useQuery({
    queryKey: ["irastransactionsData"],
    queryFn: getIrasTransactions,
    enabled: validateOnly === true,
  });

  const { setFilters, filterFields, filteredData } = useDataTableFilters(
    irasTransactionFilters,
    irasTransactions
  );

  const handleGenerateReport = async () => {
    try {
      const selectedIds = Object.keys(selectedRowIds).filter((id) => selectedRowIds[id]);

      if (selectedIds.length === 0) {
        toast.error("No transactions selected.");
        return;
      }

      // Log selected IDs and flags
      console.log("Generating report for selected IDs:", selectedIds);
      console.log("Is Amendment:", isAmendment);
      console.log("Include Previous:", includePrevious);

      const payload = {
        selected_ids: selectedIds.join(","),
        ammendment: isAmendment,
        include_previous: includePrevious,
      };

      const response = await generateAndSendReport(payload);

      toast.success(response.message || "Report generated and sent successfully.");
    } catch (err) {
      console.error("Generate and send report error:", err);
      toast.error("Failed to generate and send report.");
    }
  };

  if (isConfigLoading || !configData) {
    return <div>Loading configuration...</div>;
  }

  if (isConfigError) {
    return <div>Failed to load configuration.</div>;
  }

  if (isRedirecting) {
    return <div>Redirecting to SingPass login...</div>;
  }

  if (validateOnly === true) {
    return (
      <div className="container mx-auto py-5 px-4">
        <Toaster position="top-center" richColors />

        <div className="flex justify-between items-center mb-4 space-x-6">
          <label className="flex items-center space-x-2">
            <Checkbox
              checked={isAmendment}
              onCheckedChange={(checked) => setIsAmendment(checked === true)}
              aria-label="Mark report as amendment"
            />
            <span>Mark report as amendment</span>
          </label>

          <label className="flex items-center space-x-2">
            <Checkbox
              checked={includePrevious}
              onCheckedChange={(checked) => setIncludePrevious(checked === true)}
              aria-label="Include receipts previously generated"
            />
            <span>Include receipts previously generated</span>
          </label>

          <Button onClick={handleGenerateReport}>Generate & Send Report</Button>
        </div>

        <DataTable
          columns={IrasTransactionColumns}
          data={filteredData}
          isLoading={isTransactionsLoading}
          filterFields={filterFields}
          onFilterChange={setFilters}
          getRowId={(row) => String(row.id)}
          selectedRowIds={selectedRowIds}
          onSelectedRowIdsChange={setSelectedRowIds}
          previewMap={[
            { label: "Name", key: "contact.display_name" },
            { label: "Amount", key: "total_amount" },
            { label: "Date", key: "receive_date" },
            { label: "Email", key: "email.email" },
            { label: "Phone", key: "phone.phone" },
          ]}
          exportFileName="Contributions"
          basePath="iras"
        />
      </div>
    );
  }

  return <div>Waiting for valid configuration...</div>;
}

