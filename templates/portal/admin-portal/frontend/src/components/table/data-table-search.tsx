"use client";

import * as React from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DataTableComboboxSearchProps {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  previewMap: { label: string; key: string }[];
  basePath: string;
  previewRows: any[];
}

// Utility to get nested value from dot-notation path
function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  if (Object.prototype.hasOwnProperty.call(obj, path)) return obj[path];
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function getPreviewValue(row: any, key: string) {
  const val = getNestedValue(row, key);
  return val !== undefined && val !== null && val !== ""
    ? key === "total_amount"
      ? `$${val}`
      : String(val)
    : "N/A";
}

export function DataTableComboboxSearch({
  search,
  setSearch,
  previewMap,
  basePath,
  previewRows,
}: DataTableComboboxSearchProps) {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const sanitizedBasePath =
    basePath.trim().replace(/^\/+|\/+$/g, "").split("/").pop() ?? "contacts";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex gap-2 items-center">
          <Search className="w-4 h-4" />
          <span className="text-sm text-muted-foreground">
            {search ? search : "Search"}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-4">
        <Command shouldFilter={false}>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search across all data..."
            autoFocus
          />
          <CommandList>
            <CommandEmpty>No matching results.</CommandEmpty>

            {search !== "" && previewRows.length > 0 && (
              <>
                {previewRows.map((row: any) => {
                  // This is the key change:
                  // For reports, treat row as the plain object
                  // For others, use row.original
                  const currentRow = sanitizedBasePath === "reports" ? row : row.original;

                  const items =
                    previewMap.length > 0
                      ? previewMap
                      : Object.keys(currentRow).map((key) => ({
                          key,
                          label: key,
                        }));

                  if (!items.length) return null;

                  const firstItem = items[0];
                  const restItems = items.slice(1);

                  // Determine the correct ID field for navigation based on the base path
                  let idForNavigation: string | number | undefined;

                  switch (sanitizedBasePath) {
                    case "contacts":
                      idForNavigation =
                        getNestedValue(currentRow, "contact.id") ??
                        currentRow.contact_id ??
                        currentRow.id;
                      break;
                    case "contributions":
                      idForNavigation = currentRow.id;
                      break;
                    case "reports":
                      // For reports, just use currentRow.id directly
                      idForNavigation = currentRow.id;
                      break;
                    default:
                      idForNavigation = currentRow.id;
                  }

                  return (
                    <CommandItem
                      key={currentRow?.id ?? Math.random()}
                      onSelect={() => {
                        setOpen(false);
                        if (idForNavigation) {
                          navigate(`/${sanitizedBasePath}/${idForNavigation}`);
                        }
                      }}
                      className="flex flex-col gap-1 text-sm w-full items-start"
                    >
                      <div className="font-semibold text-base truncate text-left w-full">
                        {getPreviewValue(currentRow, firstItem.key)}
                      </div>
                      <div className="flex flex-col gap-1 text-left w-full">
                        {restItems.map((item) => (
                          <div
                            key={item.key}
                            className="flex gap-2 text-muted-foreground text-sm"
                          >
                            <span className="w-28 font-medium">{item.label}:</span>
                            <span className="truncate">
                              {getPreviewValue(currentRow, String(item.key))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CommandItem>
                  );
                })}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
