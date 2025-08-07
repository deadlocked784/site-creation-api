import { useState, useEffect } from "react";
import { applyFilters } from "@/components/table/filter-utils";
import type { FilterField } from "@/types/filter";

export function useDataTableFilters<T>(
  getFilters: () => Promise<FilterField[]>,
  rawData: T[]
) {
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [filterFields, setFilterFields] = useState<FilterField[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(true);

  useEffect(() => {
    getFilters()
      .then((f) => setFilterFields(f))
      .catch((err) => console.error("Error loading filters:", err))
      .finally(() => setFiltersLoading(false));
  }, [getFilters]);

  // Cast rawData to a general object shape only for filtering logic
  const filteredData = applyFilters(
    rawData as unknown as Record<string, unknown>[],
    filters
  ) as T[];

  return {
    filters,
    setFilters,
    filterFields,
    filtersLoading,
    filteredData,
  };
}
