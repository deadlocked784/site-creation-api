import { Button } from "@/components/ui/button";
import { IconEdit } from "@tabler/icons-react";
import { usePermissions } from "@/hooks/use-permissions"
import { Skeleton } from "@/components/ui/skeleton"; 

interface ButtonWithIconProps {
  onOpenDialog: () => void;
  disabled?: boolean;
}

export function UpdateButtonWithIcon({ onOpenDialog, disabled = false }: ButtonWithIconProps) {
  const { data: userPermissions, isLoading } = usePermissions();

  if (isLoading) {
    // Optional: show placeholder while loading
    return <Skeleton className="h-8 w-[150px] rounded-md" />;
  }

  if (!userPermissions?.capabilities?.access_all_cases_and_activities) {
    return null;
  }

  return (
    <Button variant="outline" size="sm" onClick={onOpenDialog} disabled={disabled}>
      <IconEdit className="mr-1" /> Update Activities
    </Button>
  );
}
