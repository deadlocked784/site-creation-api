import type { CustomGroup } from '@/types/custom-groups';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getCustomGroups = async (): Promise<CustomGroup[]> => {
    return axios.get(`${BASE_URL}/api/custom-groups`, {
    }).then(res => res.data.data);

};
