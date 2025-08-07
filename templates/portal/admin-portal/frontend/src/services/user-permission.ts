import type {UserPermission} from '@/types/user-permission';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL;


export const getUserPermission = async (): Promise<UserPermission> => {
    return axios.get(`${BASE_URL}/api/user-permissions`, {
    }).then(res => res.data.data);

};
