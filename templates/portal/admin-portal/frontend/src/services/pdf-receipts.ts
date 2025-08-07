import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const pdfReceipts = async (ids: number[]) => {
  return axios.post(`${BASE_URL}/api/pdf-receipts`, { ids })
    .then(res => res.data);
};
