export type EntityType = "activity" | "contact" | "contribution";

export const permissionMap: Record<
  EntityType,
  {
    edit: string[];
    delete: string[];
  }
> = {
  activity: {
    edit: ["edit_activity", "edit_activities"],
    delete: ["delete_activity", "delete_activities"],
  },
  contact: {
    edit: ["edit_my_contact", "edit_contacts"],
    delete: ["delete_contacts", "edit_all_contacts"],
  },
  contribution: {
    edit: ["edit_contributions"],
    delete: ["delete_in_civicontribute", "delete_contributions"],
  },
};


export interface UserPermission {
  roles: string[];
  capabilities: Record<string, boolean>;
};
