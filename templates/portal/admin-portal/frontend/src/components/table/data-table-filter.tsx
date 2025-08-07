import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListFilter } from "lucide-react";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { FilterField, DataTableFilterProps} from "@/types/filter"; 


export function DataTableFilter<TData>({
  fields = [],
  onChange,
}: DataTableFilterProps<TData>) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => setIsReady(true), 50);
      return () => clearTimeout(timeout);
    } else {
      setIsReady(false);
    }
  }, [open]);

  const handleChange = (id: string, value: any) => {
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  const handleRangeChange = (id: string, type: "min" | "max", value: string) => {
    setFilters((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [type]: value,
      },
    }));
  };

  const applyFilters = () => {
    onChange?.(filters);
    setOpen(false);
  };

  const resetFilters = () => {
    setFilters({});
    onChange?.({});
  };

  if (!fields.length) {
    return (
      <Button variant="outline" size="sm" disabled>
        <ListFilter className="mr-2 h-4 w-4" />
        Filter
      </Button>
    );
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ListFilter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter</DialogTitle>
        </DialogHeader>

        {isReady ? (
          <div className="space-y-6">
            {Object.entries(
              fields.reduce((acc, field) => {
                const group = field.group || "";
                if (!acc[group]) acc[group] = [];
                acc[group].push(field);
                return acc;
              }, {} as Record<string, FilterField[]>)
            ).map(([groupName, groupedFields]) => (
              <div key={groupName} className="border border-gray-300 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-3">{groupName}</h4>
                <div className="space-y-4">
                  {groupedFields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label>{field.label}</Label>

                      {field.type === "text" && (
                        <Input
                          value={filters[field.id] || ""}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                        />
                      )}

                      {field.type === "numberRange" && (
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Min"
                            value={filters[field.id]?.min || ""}
                            onChange={(e) =>
                              handleRangeChange(field.id, "min", e.target.value)
                            }
                          />
                          <Input
                            type="number"
                            placeholder="Max"
                            value={filters[field.id]?.max || ""}
                            onChange={(e) =>
                              handleRangeChange(field.id, "max", e.target.value)
                            }
                          />
                        </div>
                      )}

                      {field.type === "dateRange" && (
                        <div className="flex gap-2">
                          <DatePicker
                            selected={
                              filters[field.id]?.min
                                ? new Date(filters[field.id].min)
                                : null
                            }
                            onChange={(date) => {
                              if (date instanceof Date && !isNaN(date.getTime())) {
                                const start = new Date(date);
                                start.setHours(0, 0, 0, 0);
                                handleRangeChange(field.id, "min", start.toISOString());
                              } else {
                                handleRangeChange(field.id, "min", "");
                              }
                            }}
                            dateFormat="dd/MM/yyyy"
                            className="w-full border border-gray-300 p-2 rounded"
                            placeholderText="Start Date"
                          />
                          <DatePicker
                            selected={
                              filters[field.id]?.max
                                ? new Date(filters[field.id].max)
                                : null
                            }
                            onChange={(date) => {
                              if (date instanceof Date && !isNaN(date.getTime())) {
                                const end = new Date(date);
                                end.setHours(23, 59, 59, 999);
                                handleRangeChange(field.id, "max", end.toISOString());
                              } else {
                                handleRangeChange(field.id, "max", "");
                              }
                            }}
                            dateFormat="dd/MM/yyyy"
                            className="w-full border border-gray-300 p-2 rounded"
                            placeholderText="End Date"
                          />
                        </div>
                      )}

                      {field.type === "select" && (
                        <select
                          className="w-full rounded border border-gray-300 p-2"
                          value={filters[field.id] || ""}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                        >
                          <option value="">All</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 text-sm text-muted-foreground">
            Loading filters...
          </div>
        )}

        <DialogFooter className="flex justify-between mt-4">
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
          <Button onClick={applyFilters}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}









