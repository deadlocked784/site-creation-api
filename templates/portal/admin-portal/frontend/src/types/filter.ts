import type { Table } from "@tanstack/react-table";
export interface SelectOption {
  label: string;
  value: string | number;
}

export interface BaseFilterField {
  id: string;
  label: string;
  group?: string;
}

export interface TextFilterField extends BaseFilterField {
  type: "text";
}

export interface NumberRangeFilterField extends BaseFilterField {
  type: "numberRange";
}

export interface DateRangeFilterField extends BaseFilterField {
  type: "dateRange";
}

export interface SelectFilterField extends BaseFilterField {
  type: "select";
  options?: SelectOption[];
  fetchOptions?: () => Promise<SelectOption[]>;
}

export type FilterField =
  | TextFilterField
  | NumberRangeFilterField
  | DateRangeFilterField
  | SelectFilterField;

export interface DataTableFilterProps<TData> {
  table: Table<TData>;
  fields?: FilterField[];
  onChange?: (filters: Record<string, unknown>) => void;
}
