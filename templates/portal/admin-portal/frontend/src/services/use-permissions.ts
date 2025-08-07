// services/use-permissions.ts
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface UserPermissionsResponse {
  roles: string[];
  capabilities: Record<string, boolean>;
}

export const getUserPermissions = async (): Promise<UserPermissionsResponse> => {
  const response = await axios.get(`${BASE_URL}/api/user-permissions`);
  return response.data.data; // assuming the structure is { success: true, data: { roles, capabilities } }
};
