import type { IrasTransaction, IrasConfiguration, GenerateReportPayload, GenerateReportResponse } from '../types/iras';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;


export function getIrasTransactions(): Promise<IrasTransaction[]> {
  return axios.get(`${BASE_URL}/api/iras/transactions`).then(res => res.data.data);
}

export function getConfigurations(): Promise<IrasConfiguration> {
  return axios.get(`${BASE_URL}/api/iras/configurations`).then(res => res.data.data);
}

export function updateConfigurations(data: Partial<IrasConfiguration>): Promise<void> {
  return axios.post(`${BASE_URL}/api/iras/configurations`, data).then(res => res.data);
}

export function generateAndSendReport(data: GenerateReportPayload): Promise<GenerateReportResponse> {
  return axios.post(`${BASE_URL}/api/iras/generate-report`, data).then(res => res.data);
}
