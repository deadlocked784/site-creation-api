import { useQueries } from '@tanstack/react-query'
import { getOptionValues } from '@/services/option-values'
import { useMemo } from 'react'
import type { OptionValue } from '@/types/option-value'

/**
 * Custom hook to fetch and manage option values for multiple option group IDs.
 *
 * This hook uses `useQueries` to fetch option values for each provided option group ID,
 * caches the results for 5 minutes, and returns loading/error states along with a helper
 * to retrieve option values for a specific group.
 *
 * @param optionGroupIds - An array of option group IDs to fetch option values for.
 * @returns An object containing:
 *   - `isLoading`: `true` if any of the queries are loading.
 *   - `isError`: `true` if any of the queries have errored.
 *   - `getOptionsForField`: A function that takes an option group ID and returns its option values.
 */
export function useOptionValues(optionGroupIds: number[]) {
  const queries = useQueries({
    queries: optionGroupIds.map((id) => ({
      queryKey: ['optionValues', id],
      queryFn: () => getOptionValues({ optionGroupId: id }),
      staleTime: 1000 * 60 * 5,
    })),
  })

  const optionValuesMap = useMemo(() => {
    return optionGroupIds.reduce((map, id, index) => {
      const q = queries[index]
      if (q?.isSuccess && q.data) map.set(id, q.data)
      return map
    }, new Map<number, OptionValue[]>())
  }, [queries, optionGroupIds])

  const isLoading = queries.some((q) => q.isLoading)
  const isError = queries.some((q) => q.isError)

  const getOptionsForField = (optionGroupId: number): OptionValue[] => optionValuesMap.get(optionGroupId) || []

  return { isLoading, isError, getOptionsForField }
}
