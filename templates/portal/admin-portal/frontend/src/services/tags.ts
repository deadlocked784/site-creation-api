import type { Tag } from '../types/tags';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Fetch all contact tags.
 * GET /api/contacts/tags
 */
export const getTags = async (): Promise<Tag[]> => {
  return axios.get(`${BASE_URL}/api/contacts/tags`)
    .then(res => res.data.data);
};
