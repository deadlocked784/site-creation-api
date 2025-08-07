import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const mailReceipts = async (ids: number[]) => {
  return axios.post(`${BASE_URL}/api/mail-receipts`, { ids })
    .then(res => res.data);
};
