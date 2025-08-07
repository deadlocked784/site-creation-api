import type { Activity } from '../types/activity';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Fetch activities by Contact ID.
 * GET /api/activities/:id
 */
export function getActivitiesByContactId(id: string): Promise<Activity[]> {
    return axios.get(`${BASE_URL}/api/activities?contact_id=${id}`).then(res => res.data.data);
}

/**
 * Fetch an activity by ID.
 * GET /api/activities/:id
 */
export function getActivity(id: string): Promise<Activity> {
    return axios.get(`${BASE_URL}/api/activities/${id}`).then(res => res.data.data);
}

/**
 * Fetch activities by activity type.
 * GET /api/activities/:id
 */
export function getActivitiesByActivityType(id: string): Promise<Activity[]> {
    return axios.get(`${BASE_URL}/api/activities?type=${id}`).then(res => res.data.data);
}

/**
 * Upload a file for an activity.
 * POST /api/activities
 * @param formData - FormData containing the file to upload
 */
// export function uploadFile(formData: FormData): Promise<{ id: number }> {
//   return axios
//     .post(`${BASE_URL}/api/activities`, formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     })
//     .then((r) => r.data);
// }

/**
 * Create a new activity.
 * POST /api/activities
 */
export function createActivity(activity: Partial<Activity>): Promise<Activity> {
    return axios
      .post(`${BASE_URL}/api/activities`, activity)
      .then(res => res.data.data);
}

/**
 * Update an existing activity.
 * PUT /api/activities/:id
 */
export function updateActivity(id: number, activity: Partial<Activity>): Promise<Activity> {
    return axios
      .put(`${BASE_URL}/api/activities/${id}`, activity)
      .then(res => res.data.data);
}  

/**
 * Bulk-update the status of multiple activities.
 * PUT /api/activities
 */
export function bulkUpdateActivityStatus(
  ids: number[],
  status: string | number
): Promise<Activity[]> {
  return axios
    .put(`${BASE_URL}/api/activities`, { ids, status })
    .then(res => res.data.data);
}

/**
 * Delete activity by ID.
 * DELETE /api/activities/:id
 */
export function deleteActivity(id: number): Promise<void> {
    return axios.delete(`${BASE_URL}/api/activities/${id}`).then(() => { });
}

export function getAllActivities(): Promise<Activity[]> {
  return axios.get(`${BASE_URL}/api/activities`).then(res => res.data.data);
}


