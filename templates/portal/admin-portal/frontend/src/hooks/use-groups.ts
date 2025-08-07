
import { useQuery } from '@tanstack/react-query'
import { getGroups } from '@/services/groups'

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
  })
}



