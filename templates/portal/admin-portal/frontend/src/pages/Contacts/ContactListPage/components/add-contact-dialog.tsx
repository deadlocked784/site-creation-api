import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import IndividualContactForm from "../../components/forms/individual-contact-form";
import OrganizationContactForm from "../../components/forms/organization-contact-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createContact } from "@/services/contacts";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";



interface AddContactDialogProps {
  currentTab: string;
  onCurrentTabChange: (tab: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canAddOrganizations: boolean;
  canAddIndividuals: boolean;
}

export default function AddContactDialog({
  currentTab,
  onCurrentTabChange,
  open,
  onOpenChange,
  canAddOrganizations,
  canAddIndividuals,
}: AddContactDialogProps) {
  const queryClient = useQueryClient();

  const navigate = useNavigate(); // inside your component

  const mutation = useMutation({
    mutationFn: createContact,
    onSuccess: (newContact) => {
      queryClient.invalidateQueries({
        queryKey: ["contacts", { contactType: currentTab }],
      });
      toast.success("Contact created successfully");
      onOpenChange(false);
      if (newContact?.id) {
        navigate(`/contacts/${newContact.id}`); 
      } else {
        console.warn("No ID returned from createContact");
      }
    },
    onError: (error: AxiosError) => {
      toast.error(
        error.response?.status === 409
          ? "Contact already exists"
          : "Failed to create contact"
      );
    },
  });

  const tabOptions = [
    canAddIndividuals && "Individual",
    canAddOrganizations && "Organization",
  ].filter(Boolean) as string[];

  const defaultTab = tabOptions.includes(currentTab)
    ? currentTab
    : tabOptions[0] ?? "Individual";

  const showButton =
    (defaultTab === "Individual" && canAddIndividuals) ||
    (defaultTab === "Organization" && canAddOrganizations);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showButton && (
        <DialogTrigger asChild>
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">
              {defaultTab === "Individual" ? "Add Contact" : "Add Organization"}
            </span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {defaultTab === "Individual" ? "Add New Contact" : "Add New Organization"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={defaultTab} onValueChange={onCurrentTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            {canAddIndividuals && (
              <TabsTrigger value="Individual">Individual</TabsTrigger>
            )}
            {canAddOrganizations && (
              <TabsTrigger value="Organization">Organization</TabsTrigger>
            )}
          </TabsList>

          {canAddIndividuals && (
            <TabsContent value="Individual">
              <IndividualContactForm
                onSave={mutation.mutate}
                isPending={mutation.isPending}
              />
            </TabsContent>
          )}

          {canAddOrganizations && (
            <TabsContent value="Organization">
              <OrganizationContactForm
                onSave={mutation.mutate}
                isPending={mutation.isPending}
              />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}