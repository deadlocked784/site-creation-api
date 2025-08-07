import { getOptionValues } from "@/services/option-values";
import { getCustomFields } from "@/services/custom-fields";
import type { FilterField } from "@/types/filter";

export function applyFilters<T extends Record<string, unknown>>(
  data: T[],
  filters: Record<string, any>,
): T[] {
  const activeFilterKeys = Object.keys(filters).filter(
    (key) => filters[key] !== null && filters[key] !== undefined && filters[key] !== ""
  );

  return data.filter((row) => {
    return activeFilterKeys.every((field) => {
      const filterValue = filters[field];
      const rowValue = row[field];

      if (filterValue == null || filterValue === "") return true;
      if (rowValue == null) return false;

      if (typeof filterValue === "string" && typeof rowValue === "string") {
        return rowValue.toLowerCase().includes(filterValue.toLowerCase());
      }

      if (
        (typeof filterValue === "number" || (typeof filterValue === "string" && !isNaN(Number(filterValue)))) &&
        (typeof rowValue === "number" || (typeof rowValue === "string" && !isNaN(Number(rowValue))))
      ) {
        return Number(rowValue) === Number(filterValue);
      }

      // Range filter for objects with min/max
      if (
        typeof filterValue === "object" &&
        (filterValue.min !== undefined || filterValue.max !== undefined)
      ) {
        const val = Number(rowValue);
        if (filterValue.min !== undefined && val < filterValue.min) return false;
        if (filterValue.max !== undefined && val > filterValue.max) return false;
        return true;
      }
      return rowValue === filterValue;
    });
  });
}


export async function getOptionValuesMap(optionGroupIds: (number | undefined)[]) {
  const optionValuesMap: Record<number, { label: string; value: string | number }[]> = {};

  await Promise.all(
    Array.from(new Set(optionGroupIds.filter((id): id is number => typeof id === "number"))).map(
      async (id) => {
        const opts = await getOptionValues({ optionGroupId: id });
        optionValuesMap[id] = opts.map((opt) => ({
          label: opt.label ?? opt.name ?? String(opt),
          value: opt.value,
        }));
      }
    )
  );
  return optionValuesMap;
}

export async function getCustomFieldsForGroups(groups: { name: string; title: string }[]) {
  const allCustomFields = (
    await Promise.all(
      groups.map(async (group) => {
        const fields = await getCustomFields(group.name);
        if (!fields) return [];
        return fields.map((field) => ({ field, group }));
      })
    )
  ).flat();

  return allCustomFields;
}



export function buildCustomFieldFilters(
  allCustomFields: Awaited<ReturnType<typeof getCustomFieldsForGroups>>,
  optionValuesMap: Record<number, { label: string; value: string | number }[]>
): FilterField[] {
  return allCustomFields.map(({ field, group }) => {
    let type: FilterField["type"] = "text";
    let options: { label: string; value: string | number }[] = [];

    switch (field.data_type) {
      case "Date":
      case "Datetime":
        type = "dateRange";
        break;
      case "Int":
      case "Float":
      case "Money":
        type = "numberRange";
        break;
      case "Boolean":
        type = "select";
        break;
       case "Checkbox":
        type = "select";
        break;
      case "String":
      case "Memo":
      default:
        type = "text";
        break;
    }

    if ((field.html_type === "Select" || field.html_type === "Radio" || field.html_type === "CheckBox") && field.option_group_id) {
      type = "select";
      options = optionValuesMap[field.option_group_id] || [];
    }

    const base = { type, id: `${group.name}.${field.name}`, label: field.label };
    return type === "select" ? { ...base, options, group: group.title } : base;
  });
}
