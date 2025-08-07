import type { OptionValue } from '@/types/option-value';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;


/**
 * Retrieves a list of option values associated with a specific option group name.
 *
 * @param optionGroupName - The name of the option group to fetch values for.
 * @returns A promise that resolves to an array of `OptionValue` objects.
 */
export function getOptionValues({ optionGroupName, optionGroupId }: { optionGroupName?: string, optionGroupId?: number }): Promise<OptionValue[]> {
  return axios.get(`${BASE_URL}/api/option-values`, { params: { 'option_group_name': optionGroupName, 'option_group_id': optionGroupId } }).then(res => res.data.data);
}