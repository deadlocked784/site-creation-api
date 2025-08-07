import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table as ShadTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { bulkUpdateActivityStatus } from "@/services/activity";
import { getOptionValues } from "@/services/option-values";
import type { Table } from "@tanstack/react-table";
import type { Activity } from "@/types/activity";

interface BulkUpdateActivitiesDialogProps<TData> {
  table: Table<TData>;
  open: boolean;
  onClose: () => void;
}

export function BulkUpdateActivitiesDialog<TData>({
  table,
  open,
  onClose,
}: BulkUpdateActivitiesDialogProps<TData>) {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [statusOptions, setStatusOptions] = useState<{ value: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original as Activity);
  const selectedActivityIds = selectedRows.map((row) => row.id);


  const { mutate, isPending } = useMutation({
    mutationFn: ({ activityIds, newStatus }: { activityIds: number[]; newStatus: string }) =>
      bulkUpdateActivityStatus(activityIds, newStatus),
    onSuccess: () => {
      toast.success("Activities updated successfully");
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      onClose();
      setSelectedStatus(null);
    },
    onError: (error) => {
      toast.error(`Error updating activities: ${error}`);
    },
  });

  useEffect(() => {
    if (!open) return;

    setIsLoading(true);
    getOptionValues({ optionGroupName: "activity_status" })
      .then((options) => {
        setStatusOptions(options);
        const completedOption = options.find((opt) => opt.label === "Completed");
        setSelectedStatus(completedOption ? completedOption.value : null);
      })
      .catch((error) => {
        console.error("Failed to load activity status options", error);
        toast.error("Failed to load activity status options.");
      })
      .finally(() => setIsLoading(false));
  }, [open]);

  const handleClose = () => {
    setSelectedStatus(null);
    onClose();
  };

  const handleUpdate = () => {
    if (!selectedStatus) {
      toast.error("Please select a new activity status.");
      return;
    }
    if (selectedActivityIds.length === 0) return;

    // Find the label for the selected status value
    const selectedLabel = statusOptions.find((opt) => opt.value === selectedStatus)?.label;
    if (!selectedLabel) {
      toast.error("Invalid status selected.");
      return;
    }

    // Pass label (not value) to mutation
    mutate({ activityIds: selectedActivityIds, newStatus: selectedLabel });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[625px] lg:max-w-[1025px] max-h-[90vh] overflow-y-auto">
        {/* Header row with title and dropdown aligned left */}
        <DialogHeader className="flex flex-row items-start gap-6 mb-4">
          <div>
            <DialogTitle>Update Activities Status</DialogTitle>
            <DialogDescription>
              {selectedActivityIds.length === 0
                ? "No activities selected."
                : `Select a new status for ${selectedActivityIds.length} selected activities:`}
            </DialogDescription>
          </div>

          <div className="w-[280px]">
            {isLoading ? (
              <Skeleton className="h-10 w-full rounded" />
            ) : (
              <Select value={selectedStatus ?? ""} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {statusOptions.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>
        </DialogHeader>

        {/* Table below header */}
        {selectedActivityIds.length > 0 && (
          <div className="max-h-[400px] overflow-y-auto border rounded my-4">
            <ShadTable>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedRows.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.id}</TableCell>
                    <TableCell>{activity.subject ?? "-"}</TableCell>
                    <TableCell>{activity["activity_type_id:name"]}</TableCell>
                    <TableCell>{activity["status_id:name"]}</TableCell>
                    <TableCell>{new Date(activity.activity_date_time).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </ShadTable>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-4 mt-4">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isPending || selectedActivityIds.length === 0 || !selectedStatus}
            className="relative min-w-[144px]"
          >
            <span className={isPending ? "opacity-0" : ""}>
              Update Status
              {selectedStatus
                ? ` to "${statusOptions.find((opt) => opt.value === selectedStatus)?.label}"`
                : ""}
            </span>
            {isPending && (
              <span className="absolute inset-0 flex items-center justify-center">
                <LoadingSpinner />
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
