import type { Contribution } from '@/types/contribution';
import type { IndividualContact, OrganizationContact } from '../types/contact';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Fetch all contacts.
 * GET /api/contacts
 */
export function getContacts({ contactType, searchString }: { contactType?: string, searchString?: string }): Promise<(IndividualContact | OrganizationContact)[]> {
  return axios.get(`${BASE_URL}/api/contacts`, {
    params: {
      type: contactType,
      searchString: searchString
    }
  }).then(res => res.data.data);
}

/**
 * Fetch a contact by ID.
 * GET /api/contacts/:id
 */
export function getContact(id: number): Promise<IndividualContact | OrganizationContact> {
  return axios.get(`${BASE_URL}/api/contacts/${id}`).then(res => res.data.data);
}



/**
 * Creates a new contact (either individual or organization) by sending a POST request to the backend API.
 *
 * @param payload - The contact data to create, omitting the 'id' and 'kind' properties.
 *                  Can be either an individual or organization contact.
 * @returns A promise that resolves to the created contact object (individual or organization).
 */
export function createContact(payload: Omit<IndividualContact, 'id'> | Omit<OrganizationContact, 'id'>): Promise<IndividualContact | OrganizationContact> {
  return axios.post(`${BASE_URL}/api/contacts`, payload).then(res => res.data.data);
}


/**
 * Deletes a contact by its ID.
 *
 * @param id - The unique identifier of the contact to be deleted.
 * @returns A promise that resolves when the contact is successfully deleted.
 */
export function deleteContact(id: number): Promise<void> {
  return axios.delete(`${BASE_URL}/api/contacts/${id}`).then(() => { });
}

/**
 * Updates a contact with the provided data.
 *
 * Note: This function currently updates a contact with a hardcoded ID of `1`.
 *
 * @param contact - The contact data to update. This can be either an individual
 *                  or an organization contact, with the 'id' property omitted.
 * @returns A promise that resolves to the updated contact data (either
 *          `IndividualContact` or `OrganizationContact`) returned by the API.
 */
export function updateContact(id: number, payload: Omit<IndividualContact, 'id'> | Omit<OrganizationContact, 'id'>): Promise<IndividualContact | OrganizationContact> {
  return axios.put(`${BASE_URL}/api/contacts/${id}`, payload).then((res) => res.data.data);
}

/**
 * Updates an individual contact with type-safe payload.
 */
export function updateIndividualContact(id: number, payload: Omit<IndividualContact, 'id'>): Promise<IndividualContact> {
  return updateContact(id, payload) as Promise<IndividualContact>;
}

/**
 * Updates an organization contact with type-safe payload.
 */
export function updateOrganizationContact(id: number, payload: Omit<OrganizationContact, 'id'>): Promise<OrganizationContact> {
  return updateContact(id, payload) as Promise<OrganizationContact>;
}

/**
 * Fetch contact contributions by contact ID.
 * GET /api/contacts/:id/contributions
 */
export function getContactContributions(id: string): Promise<Contribution[]> {
  return axios.get(`${BASE_URL}/api/contacts/${id}/contributions`).then(res => res.data.data);
}

/**
 * Fetch contact contributions count by contact ID.
 * GET /api/contacts/:id/contributions/count
 */
export function getContactContributionsCount(id: string): Promise<number> {
  return axios.get(`${BASE_URL}/api/contacts/${id}/contributions/count`).then(res => res.data.count);
}

/**
 * Fetch contact activities count by contact ID.
 * GET /api/contacts/:id/activities/count
 */
export function getContactActivitiesCount(id: string): Promise<number> {
  return axios.get(`${BASE_URL}/api/contacts/${id}/activities/count`).then(res => res.data.count);
}


