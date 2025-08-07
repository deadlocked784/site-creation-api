import { Label } from "@/components/ui/label";
import type { CustomField } from "@/types/custom-fields";
import { useOptionValues } from "@/hooks/use-option-values";   
import { useEntityReferences } from "@/hooks/use-entity-references";
import { format } from 'date-fns'

interface Props {
  customGroupName: string;
  customFields: CustomField[];
  activity: Record<string, unknown>;
}

const formatDisplayValue = (field: CustomField, value: any): string => {
  if (value === null || value === undefined || value === "") return "-";

  const dataType = field.data_type?.toLowerCase();

  if (dataType === "boolean") return value === true || value === "true" ? "Yes" : "No";
  
  // INITIAL CODE
  // if (dataType === "boolean") return value === true || value === "true" ? "Yes" : "No";
  // if (dataType === "date" || dataType === "datetime") {
  //   try {
  //     const date = new Date(value);
  //     return date.toLocaleString(undefined, {
  //       year: "numeric",
  //       month: "long",
  //       day: "numeric",
  //       ...(dataType === "datetime" && { hour: "2-digit", minute: "2-digit" }),
  //     });
  //   } catch {
  //     return String(value);
  //   }
  // }

  // CIVICRM DEFAULT DATE TIME FORMAT 
  // if (dataType === "date" || dataType === "datetime") {
  //   try {
  //     const date  = new Date(value);
  //     const day   = date.getDate();
  //     const month = date.toLocaleString("default", { month: "long" });
  //     const year  = date.getFullYear();

  //     // always include time for both date and datetime fields
  //     const time = date.toLocaleTimeString([], {
  //       hour:   "2-digit",
  //       minute: "2-digit",
  //       hour12: true,
  //     });
      
  //     const formatted = `${day} ${month}, ${year} ${time}`;
  //     return formatted;
  //   } catch {
  //     return String(value);
  //   }
  // }

  // ALTERED DATE FORMAT DD/MM/YYYY, HH:MM A
  if (dataType === "date" || dataType === "datetime") {
    try {
      const date = new Date(value);
      return format(date, "dd/MM/yyyy, hh:mm a");
    } catch {
      return String(value);
    }
  }

  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toLocaleString();
  if (Array.isArray(value)) return value.join(", ");

  return String(value);
};

export default function ActivityCustomFields({ customGroupName, customFields, activity }: Props) {
  const optionGroupIds = customFields
    .map((f) => f.option_group_id)
    .filter((id): id is number => typeof id === "number");

  const { getOptionsForField } = useOptionValues(optionGroupIds);

  // Collect all entity reference fields for this group
  const entityReferenceFields = customFields.filter(
    (field) => field.data_type?.toLowerCase() === "entityreference" && field.fk_entity
  );
  // Build entity references for useEntityReferences
  const entityReferences = entityReferenceFields.map((field) => ({
    type: field.fk_entity as string,
    filter: undefined, // We'll filter by id below
  }));
  // Fetch all referenced entities
  const { getEntityOptionsForField } = useEntityReferences(entityReferences);

  return (
    <>
      {customFields.map((field) => {
        const key = `${customGroupName}.${field.name}`;
        const rawValue = activity[key];
        // console.log("Looking for:", `${customGroupName}.${field.name}`, "→ Converted key:", key, "→ Value:", value);

        let display = formatDisplayValue(field, rawValue);

        if (field.option_group_id != null && rawValue != null) {
          const opts = getOptionsForField(field.option_group_id);
          const matched = opts.find(
            (o) =>
              String(o.value) === String(rawValue) ||
              String(o.id) === String(rawValue)
          );
          if (matched) display = matched.label;
        }

        if (
          field.data_type?.toLowerCase() === "entityreference" &&
          field.fk_entity &&
          rawValue != null
        ) {
          // Find the referenced entity by id
          const entityType = field.fk_entity as string;
          const entityOptions = getEntityOptionsForField(entityType);
          const matched = entityOptions.find((e) => String(e.id) === String(rawValue));
          if (matched) display = matched.name;
        }

        return (
          <div key={field.id}>
            <Label>{field.label}</Label>
            <p>{display}</p>
          </div>
        );
      })}
    </>
  );
}