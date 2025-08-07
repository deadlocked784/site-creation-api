import ContributionForm from "@/pages/Contributions/components/forms/contribution-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createContribution } from "@/services/contributions";
import { type Contribution } from "@/types/contribution";

interface NewContributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId?: number;
  contactName?: string;
  hideTrigger?: boolean;
}

export function NewContributionDialog({
  open,
  onOpenChange,
  contactId,
  contactName,
  hideTrigger = false,
}: NewContributionDialogProps) {
  const initialData: Partial<Contribution> = {
    contact_id: contactId,
    "contact.display_name": contactName,
  };

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: createContribution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
      toast.success("Contribution created successfully!");
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error creating contribution:", error);
      toast.error("Failed to create contribution. Please try again.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus />
            <span className="hidden lg:inline">New Contribution</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[625px] lg:max-w-[1025px]">
        <DialogHeader>
          <DialogTitle>New Contribution</DialogTitle>
        </DialogHeader>
        <ContributionForm
          onSave={mutate}
          isPending={isPending}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
}
