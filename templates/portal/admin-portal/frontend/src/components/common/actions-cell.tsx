import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import DeleteDialog from "../dialogs/delete-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { toast } from "sonner";
import type { Row } from "@tanstack/react-table";
import EditDialog from "../dialogs/edit-dialog";
import { getUserPermission } from "@/services/user-permission";
import { permissionMap, type EntityType } from "@/types/user-permission";


const entityConfig = {
  activity: {
    path: "activities",
    displayName: "Activity",
  },
  contact: {
    path: "contacts",
    displayName: "Contact",
  },
  contribution: {
    path: "contributions",
    displayName: "Contribution",
  },
};

/* 
  ! Fix the type structure.
  ! Later, create a new type called payload for each entity. This WithId will be redundant.
  ! For example, ActivityPayload, ContactPayload, ContributionPayload.
*/

interface WithId {
  id: number;
}


interface Props<T extends Record<string, any> & WithId> {
  row: Row<T>;
  type: EntityType;
  queryKey: string[];
  EditForm: React.ComponentType<{
    initialData: T;
    onSave: (payload: Omit<T, "id">) => void;
    isPending: boolean;
  }>;
  updateFn: (id: number, payload: Omit<T, "id">) => Promise<T | number>;
  deleteFn: (id: number) => Promise<void>;
  dialogTitle?: string;
}

export function ActionsCell<T extends Record<string, any> & WithId>({
  row,
  type,
  queryKey,
  EditForm,
  updateFn,
  deleteFn,
}: Props<T>) {
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { path, displayName } = entityConfig[type];


  const { data, isLoading } = useQuery({
    queryKey: ["userpermission"],
    queryFn: getUserPermission,
  });


  const userCapabilities = data?.capabilities ?? {};

  // Check if user has any required permissions for the action on this entity type
  function hasPermission(action: "edit" | "delete"): boolean {
    const requiredPermissions = permissionMap[type]?.[action] || [];

    const userRoles = data?.roles ?? [];

    // If the user is an Administrator or Super Admin — give full access
    if (userRoles.includes("administrator") || userRoles.includes("super_admin")) {
      return true;
    }

    return requiredPermissions.some((perm) => userCapabilities[perm]);
  }


  const canEdit = hasPermission("edit");
  const canDelete = hasPermission("delete");

  // Mutations for update and delete
  const updateMutation = useMutation({
    mutationFn: (payload: Omit<T, "id">) => updateFn(row.original.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(`${displayName} has been updated successfully`);
      setEditDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error updating:", error);
      if (error instanceof AxiosError && error.response?.status === 404) {
        toast.error(`${displayName} not found.`);
      } else if (error instanceof AxiosError && error.response?.status === 409) {
        toast.error(`${displayName} cannot be updated due to existing dependencies.`);
      } else {
        toast.error(`Failed to update ${type}. Please try again.`);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteFn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(`${displayName} has been deleted successfully`);
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error deleting:", error);
      if (error instanceof AxiosError && error.response?.status === 404) {
        toast.error(`${displayName} not found.`);
      } else if (error instanceof AxiosError && error.response?.status === 409) {
        toast.error(`${displayName} cannot be deleted due to existing dependencies.`);
      } else {
        toast.error(`Failed to delete ${type}. Please try again.`);
      }
    },
  });

  if (isLoading) return null;
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <EllipsisVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem asChild>
            <Link to={`/${path}/${row.original.id}`}>View</Link>
          </DropdownMenuItem>

          {canEdit && (
            <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
              Edit
            </DropdownMenuItem>
          )}

          {(canEdit && canDelete) && <DropdownMenuSeparator />}

          {canDelete && (
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        type={row.original["activity_type_id:name"] || type}
        Form={
          <EditForm
            initialData={row.original}
            onSave={(payload) => updateMutation.mutate(payload)}
            isPending={updateMutation.isPending}
          />
        }
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        type={type}
        onConfirm={() => deleteMutation.mutate(row.original.id)}
      />
    </>
  );
}
