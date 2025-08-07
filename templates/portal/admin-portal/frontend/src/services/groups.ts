import type { IndividualContact, OrganizationContact } from '@/types/contact';
import type { Group } from '@/types/groups';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getGroups = async (): Promise<Group[]> => {
    return axios.get(`${BASE_URL}/api/contacts/groups`, {
    }).then(res => res.data.data);

};

/**
 * Fetch all contacts in a specific group.
 * GET /api/contacts/group/:groupId
 */
export function getContactsByGroup(groupId: number): Promise<(IndividualContact | OrganizationContact)[]> {
  return axios.get(`${BASE_URL}/api/contacts/group/${groupId}`)
    .then(res => res.data.data);
}
