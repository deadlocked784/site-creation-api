import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from "@/components/ui/select";
import ActivityForm from "@/pages/Activities/components/activity-form";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOptionValues } from "@/services/option-values";
import { createActivity } from "@/services/activity";
import { getContact } from "@/services/contacts";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import type { Activity } from "@/types/activity";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

export function AddActivityDialog() {

  const { id: rawId } = useParams<{ id: string }>();
  const contactId = rawId;

  const [open, setOpen] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState<{ value: string; name: string } | null>(null);

  const { data: contact } = useQuery({
    queryKey: ["contacts", contactId],
    queryFn: () => getContact(Number(contactId)),
    enabled: !Number.isNaN(contactId),
  });

  const { data: activityTypes, isLoading, isError } = useQuery({
    queryKey: ['activity-types'],
    queryFn: () => getOptionValues({ optionGroupName: 'activity_type' }),
  });

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (vars: Omit<Activity, 'id'>) => createActivity(vars),
    onSuccess: () => {
      toast.success("Activity has been created successfully");
      queryClient.invalidateQueries({ queryKey: ['contact', 'activities'] });
      setOpen(false);
      setSelectedActivityType(null);
    },
    onError: (error) => {
      console.error("Error creating activity: ", error);
    }
  });

  const handleSelect = (value: string) => {
    const selected = activityTypes?.find((type) => type.value === value);
    if (selected) {
      setSelectedActivityType({ value: selected.value, name: selected.name });
      setOpen(true);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-10 w-[280px]" />;
  }

  if (isError) {
    return <div className="text-red-500">Failed to load activity types</div>;
  }

  // console.log(contactId, contact)
    
  return (
    <>
      <Select
        value={selectedActivityType?.value ?? ''}
        onValueChange={handleSelect}
      >
        <SelectTrigger className="w-[280px] text-black">
          <Plus className="h-4 w-4 text-black" />
          <span className="text-black font-medium">
            {selectedActivityType?.name || 'New Activity'}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
          {activityTypes?.map((type) => (
            <SelectItem key={type.id} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
          setSelectedActivityType(null); 
          }
      }}>
        <DialogContent className="sm:max-w-[625px] lg:max-w-[1025px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create {selectedActivityType?.name || ''} Activity</DialogTitle>
            <DialogDescription>Enter the activity details, click save when you are done.</DialogDescription>
          </DialogHeader>

         {selectedActivityType && (
           <ActivityForm
             initialData={{
               activity_type_id: selectedActivityType.value,
               "activity_type_id:name": selectedActivityType.name,
               source_contact_id: contactId,
               "source.display_name": contact?.display_name,
               "activity_date_time": new Date(),
             }}
             isPending={isPending}
             onSave={mutate}
           />
         )}
        </DialogContent>
      </Dialog>
    </>
  );
}