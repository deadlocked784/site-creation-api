import type { Contribution } from "@/types/contribution";
import axios from "axios";


const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Fetch all contributions.
 * GET /api/contibutions
 */

export function getContributions(): Promise<Contribution[]> {
  return axios.get(`${BASE_URL}/api/contributions`).then(res => res.data.data);
}

/**
 * Fetch a contribution by ID.
 * GET /api/contributions/:id
 */
export function getContribution(id: string): Promise<Contribution> {
  return axios.get(`${BASE_URL}/api/contributions/${id}`).then(res => res.data.data);
}

/**
 * Create new contribution.
 * POST /api/contributions
 */
export function createContribution(contributionData: Omit<Contribution, 'id'>): Promise<number> {
  return axios.post(`${BASE_URL}/api/contributions`, { contributionData }).then(res => res.data.data);
}

/**
 * Update an existing contribution.
 * PUT /api/contributions/:id
 */
export function updateContribution(id: number, contributionData: Omit<Contribution, 'id'>): Promise<number> {
  return axios.put(`${BASE_URL}/api/contributions/${id}`, { contributionData }).then(res => res.data.data);
}

/**
 * Delete a contribution by ID.
 * DELETE /api/contributions/:id
 */
export function deleteContribution(id: number): Promise<void> {
  return axios.delete(`${BASE_URL}/api/contributions/${id}`).then(() => { });
}