import type { FinancialType } from '../types/financial-type';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Fetch all contact types.
 * GET /api/contact-types
 */
export function getFinancialTypes(): Promise<FinancialType[]> {
  return axios.get(`${BASE_URL}/api/financial-types`).then(res => res.data.data);
}