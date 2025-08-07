import { useEffect, useRef } from "react";

export function useClearFiltersOnDialogClose(open: boolean, clearFilters: () => void) {
  const wasOpen = useRef(open);

  useEffect(() => {
    if (wasOpen.current && !open) {
      clearFilters();
    }
    wasOpen.current = open;
  }, [open, clearFilters]);
}
