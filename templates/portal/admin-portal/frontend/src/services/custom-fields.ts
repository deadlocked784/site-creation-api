import type { CustomField } from '@/types/custom-fields';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getCustomFields = async (customGroupName: string): Promise<CustomField[]> => {
    return axios.get(`${BASE_URL}/api/custom-fields`, {
        params: {
            custom_group_name: customGroupName
        }
    }).then(res => res.data.data);

};
