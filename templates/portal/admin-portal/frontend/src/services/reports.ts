import type { Report } from '@/types/reports';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL;


export const getReports = async (): Promise<Report[]> => {
  return axios.get(`${BASE_URL}/api/reports`, {
  }).then(res => res.data.data);

};

export async function getReportById(id: number) {
  const response = await axios.get(`${BASE_URL}/api/reports/${id}`);
  return response.data.data;
}

export async function getReportRowsByInstanceId(id: number) {
  const response = await axios.get(`${BASE_URL}/api/reports/getRowsByInstanceId/${id}`);
  return response.data.data;
}

export async function getSearchKitReports(): Promise<any[]> {
  const response = await axios.get(`${BASE_URL}/api/reports/searchkits/`);
  return response.data.data;
}

