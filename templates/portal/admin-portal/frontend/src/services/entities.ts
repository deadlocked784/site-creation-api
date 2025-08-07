import type { Entity } from '@/types/entities';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getEntityByType = async (entityType: string, filter?: string): Promise<Entity[]> => {
    return axios.get(`${BASE_URL}/api/entities/${entityType}`, { params: { filter } }).then(res => res.data.data);
};