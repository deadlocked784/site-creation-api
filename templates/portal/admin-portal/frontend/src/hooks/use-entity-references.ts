import { useQueries } from '@tanstack/react-query'
import { getEntityByType } from '@/services/entities'
import { useMemo } from 'react'
import type { Entity } from '@/types/entities'

interface EntityReference {
    type: string;
    filter?: string;
}

/**
 * Custom React hook to fetch and map entity reference options for form fields.
 *
 * Given an array of entity references, this hook performs parallel queries to fetch entities
 * for each reference type and filter. It then constructs a mapping of entity types to their
 * corresponding options, formatted for use in select fields.
 *
 * @param entityReferences - Array of entity reference objects, each specifying a type and filter.
 * @returns An object containing:
 *   - `isLoading`: `true` if any query is loading.
 *   - `isError`: `true` if any query has errored.
 *   - `getEntityOptionsForField`: Function to retrieve the options array for a given entity type.
 */
export function useEntityReferences(entityReferences: EntityReference[]) {
    const queries = useQueries({
        queries: entityReferences.map((ref) => ({
            queryKey: ['entities', ref.type, ref.filter],
            queryFn: () => getEntityByType(ref.type, ref.filter),
            staleTime: 1000 * 60 * 10,
        })),
    })

    const entityOptionsMap = useMemo(() => {
        const map = new Map<string, Entity[]>();

        queries.forEach((query, index) => {
            if (!query.isSuccess || !query.data) return;

            const { type } = entityReferences[index];
            const data = query.data;

            const options = data.map((d: Entity) => {
                let name: string;

                if (type.toLowerCase() === 'contact') {
                    name = d.contact_type === 'Individual'
                        ? String(d.first_name ?? '')
                        : String(d.organization_name ?? '')
                    if (d['email_primary.email']) {
                        name += ` (${String(d['email_primary.email'])})`
                    }
                } else if (type.toLowerCase() === 'activity') {
                    name = `${String(d.subject ?? '')} (${String(d["activity_type_id:name"] ?? '')})`
                } else {
                    name = String(d.subject || d.display_name || d.name || d.id || '')
                }

                return {
                    id: d.id,
                    name
                };
            });

            map.set(type, options);
        });

        return map;
    }, [queries, entityReferences]);

    const isLoading = queries.some((query) => query.isLoading)
    const isError = queries.some((query) => query.isError)

    return {
        isLoading,
        isError,
        getEntityOptionsForField: (entityType: string): Entity[] => {
            return entityOptionsMap.get(entityType) || []
        }
    }
}