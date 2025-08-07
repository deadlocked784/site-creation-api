import type { Country } from '@/types/country';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getCountries = async (): Promise<Country[]> => {
    return axios.get(`${BASE_URL}/api/countries`).then(res => res.data.data);
};
