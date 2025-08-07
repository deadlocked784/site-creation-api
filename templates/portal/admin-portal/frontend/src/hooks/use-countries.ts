import { useQuery } from '@tanstack/react-query'
import { getCountries } from '@/services/countries'

export function useCountries(enabled = true) {
    return useQuery({
        queryKey: ['countries'],
        queryFn: getCountries,
        enabled,
        staleTime: Infinity,
    })
}