import { useQuery } from '@tanstack/react-query'
import { getCustomFields } from '@/services/custom-fields'

export function useCustomFields(customGroupName: string) {
    return useQuery({
        queryKey: ['customFields', customGroupName],
        queryFn: () => getCustomFields(customGroupName),
    })
}
