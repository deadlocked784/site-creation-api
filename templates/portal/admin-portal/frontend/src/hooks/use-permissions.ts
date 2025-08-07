import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const BASE_URL = import.meta.env.VITE_BASE_URL;

interface UserPermissions {
  roles?: string[];
  capabilities: Record<string, boolean>;
}

/**
 * Fetch current user's permissions from backend
 * GET /api/user-permissions
 */
export const fetchUserPermissions = async (): Promise<UserPermissions> => {
  return axios.get(`${BASE_URL}/api/user-permissions`)
    .then(res => res.data.data);
};

export const usePermissions = () => {
  return useQuery<UserPermissions>({
    queryKey: ['user-permissions'],
    queryFn: fetchUserPermissions,
    staleTime: Infinity,
  });
};

/**
 * Determine available tabs based on user capabilities
 */
export const getAvailableTabs = (permissions: UserPermissions) => {
  const { capabilities } = permissions;
  const tabs = [];

  // Show Individual tab if user has basic contact view/add rights
  if (capabilities.view_individuals || capabilities.add_contacts) {
    tabs.push({ value: "Individual", label: "Individual" });
  }

  // Show Organization tab if user has related capabilities
  if (
    capabilities.view_organizations ||
    capabilities.manage_organizations ||
    checkAdminRights(capabilities)
  ) {
    tabs.push({ value: "Organization", label: "Organization" });
  }

  // Show Groups tab if user can access groups
  if (capabilities.view_groups || capabilities.manage_groups || capabilities.access_ajax_api) {
    tabs.push({ value: "Groups", label: "Groups" });
  }

  return tabs;
};

/**
 * Check if user has specific permission(s)
 * @param permissions User permissions object
 * @param capability Single capability or array of capabilities
 * @param requireAll Whether all capabilities must be present (default: false)
 */
export const checkPermission = (
  permissions: UserPermissions,
  capability: string | string[],
  requireAll = false
): boolean => {
  const { capabilities } = permissions;
  if (Array.isArray(capability)) {
    return requireAll
      ? capability.every(cap => capabilities[cap] === true)
      : capability.some(cap => capabilities[cap] === true);
  }
  return capabilities[capability] === true;
};

/**
 * Helper to detect admin-level roles based on capabilities
 */
const checkAdminRights = (capabilities: Record<string, boolean>): boolean => {
  const adminCaps = [
    'edit_users',
    'edit_plugins',
    'manage_options',
    'ure_edit_roles',
    'edit_theme_options'
  ];
  return adminCaps.some(cap => capabilities[cap]);
};