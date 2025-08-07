// hooks/use-tags.ts
import { useQuery } from '@tanstack/react-query'
import { getTags } from '@/services/tags'

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
  })
}
