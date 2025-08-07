import type { ContactType, ContactTypeParentSubtype } from '../types/contact-type';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Fetch all contact types.
 * GET /api/contact-types
 */
export function getContactTypes(): Promise<ContactType[]> {
    return axios.get(`${BASE_URL}/api/contact-types`).then(res => res.data.data);
}

export function getParentsAndSubtypes(): Promise<ContactTypeParentSubtype> {
    return axios.get(`${BASE_URL}/api/contact-types/parentsAndSubtypes`).then(res => res.data.data);
}