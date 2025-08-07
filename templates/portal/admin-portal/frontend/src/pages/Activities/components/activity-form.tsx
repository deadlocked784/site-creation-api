import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useQuery } from "@tanstack/react-query";
import SkeletonForm from "@/components/forms/skeleton-form";
import { ContactCombobox } from "@/components/fields/combobox/contact-combobox";
import { DateTimePicker } from "@/components/common/datetime-picker";
import { Link } from "react-router-dom";
import { getOptionValues } from "@/services/option-values";
import type { Activity } from "@/types/activity";
import { CustomFieldGroup } from "@/components/forms/fields/custom-field-group";
import { convertToCamelCase, convertToSnakeCase } from "@/lib/case-convertor";
import type { CustomField } from "@/types/custom-fields";
import { useEffect, useMemo } from "react";
import { createFormSchemaWithCustomFields } from "@/lib/form-schema-builder";
import { useCustomFields } from "@/hooks/use-custom-fields";

// Helper: Only treat as date if string matches strict date format
function isStrictDateString(str: string): boolean {
  // ISO 8601 or yyyy-mm-dd or yyyy-mm-ddTHH:MM:SS
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:?\d{2})?)?$/.test(str);
}

const activityBaseSchema = z.object({
  activityTypeId: z.coerce.number(),
  activityTypeId$name: z.string(),
  sourceContactId: z.coerce.number({ message: "Required" }),
  targetContactId: z.string().optional().nullable(),
  assigneeContactId: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  activityDateTime: z.coerce.date(),
  duration: z.coerce.number().optional().nullable(),
  statusId$name: z.string().nonempty({ message: "Required" }),
  details: z.string().optional().nullable(),
});

export type FormValues = z.infer<typeof activityBaseSchema>;

const getBaseDefaultValues = (initialData?:  Partial<Activity>) => {
  return initialData
    ? Object.fromEntries(
        Object.entries(initialData).map(([key, value]) => [
          convertToCamelCase(key),
          typeof value === 'number'
            ? String(value)
            : (typeof value === 'string' && isStrictDateString(value)
                ? new Date(value)
                : value)
        ])
      )
    : {
      activityTypeId: "",
      activityTypeId$name:"",
      sourceContactId: "",
      targetContactId: undefined,
      assigneeContactId: undefined,
      subject: undefined,
      location: undefined,
      activityDateTime: new Date(),
      duration: undefined,
      statusId$name: "",
      details: undefined,
      }
}


const getCompleteDefaultValues = (
  initialData: Partial<Activity> | undefined,
  customFields: CustomField[],
  customFieldGroupName: string
) =>  {
  const defaultValues = getBaseDefaultValues(initialData)

  // Add default values for custom fields
  customFields.forEach((field) => {
    const fieldName = convertToCamelCase(`${customFieldGroupName}.${field.name}`)
    if (!(fieldName in defaultValues)) {
      (defaultValues as Record<string, unknown>)[fieldName] = undefined
    }
  })

  return defaultValues
}

interface Props {
  /** If provided, we’re in “edit” mode; otherwise it’s new */
  initialData: Partial<Activity>;

  /** Disables the button while saving/updating */
  isPending: boolean;
  /** Called with the mapped payload on Save/Update */
  onSave: (variables: Omit<Activity, "id">) => void;
}


export default function ActivityForm({ initialData, isPending, onSave }: Props) {
  const activityTypeName = initialData["activity_type_id:name"]
  const customFieldGroupName = activityTypeName!.split(' ').join('_')
//   console.log("initialData.source_contact_id: " + initialData.source_contact_id + " initialData['source.display_name']: " + initialData["source.display_name"]);
  const { data: customFields = [], isLoading: isLoadingFields } = useCustomFields(customFieldGroupName)


  const statusQuery = useQuery({
    queryKey: ["activity_status"],
    queryFn: () => getOptionValues({ optionGroupName: "activity_status" }),
  });

  const formSchema = useMemo(
    () => createFormSchemaWithCustomFields(activityBaseSchema, customFields, customFieldGroupName),
    [customFields]
  )

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: getBaseDefaultValues(initialData),
  });

  useEffect(() => {
    if (customFields && !isLoadingFields) {
      const defaultValues = getCompleteDefaultValues(initialData, customFields, customFieldGroupName)
      form.reset(defaultValues)
    }
  }, [customFields, isLoadingFields, initialData, customFieldGroupName, form])

  // Add debug log for form errors
  useEffect(() => {
    if (form.formState.isSubmitted && !form.formState.isValid) {
      // eslint-disable-next-line no-console
      console.error('Form errors:', form.formState.errors);
    }
  }, [form.formState.isSubmitted, form.formState.isValid, form.formState.errors]);

  if (statusQuery.isLoading) {
    return <SkeletonForm />;
  }

  if (statusQuery.isError) {
    return <div className="text-red-500">Failed to load activity statuses.</div>;
  }


// ORIGINAL CODE
// const onSubmit = async (values: z.infer<typeof formSchema>) => {
//   const hasFiles = Object.values(values).some(value => value instanceof File);
  
//   if (hasFiles) {
//     const formData = new FormData();
    
//     Object.entries(values).forEach(([key, value]) => {
//       const fieldName = convertToSnakeCase(key, customFieldGroupName);
      
//       if (value instanceof File) {
//         formData.append(fieldName, value);
//       } else if (value instanceof Date) {
//         formData.append(fieldName, value.toISOString());
//       } else if (value !== undefined && value !== null && value !== '') {
//         formData.append(fieldName, String(value));
//       }
//     });
    
//     // Call onSave with FormData instead of uploadFile
//     onSave(formData as any);
//   } else {
//     // Handle regular JSON submission
//     const payload = Object.fromEntries(
//       Object.entries(values).map(([key, value]) => [
//         convertToSnakeCase(key, customFieldGroupName),
//         value instanceof Date ? value.toISOString() : value
//       ])
//     );
//     onSave(payload as Omit<Activity, 'id'>);
//   }
// };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        convertToSnakeCase(key, customFieldGroupName),
        value instanceof Date ? value.toLocaleString() : value
      ])
    )
    onSave(payload as Omit<Activity, 'id'>);
}

  // NEW CODE V2
  // const onSubmit = async (values: z.infer<typeof formSchema>) => {
  //   console.log('Form values before processing:', values);
    
  //   const hasFiles = Object.values(values).some(value => value instanceof File);
  //   console.log('Has files:', hasFiles);
    
  //   if (hasFiles) {
  //     const formData = new FormData();
      
  //     Object.entries(values).forEach(([key, value]) => {
  //       // Handle custom fields differently
  //       let fieldName: string;
        
  //       if (key.startsWith(convertToCamelCase(customFieldGroupName))) {
  //         // For custom fields, convert back to proper format
  //         const customFieldName = key.replace(convertToCamelCase(customFieldGroupName) + '.', '');
  //         fieldName = `${customFieldGroupName}.${customFieldName}`;
  //       } else {
  //         // For regular fields, use snake_case conversion
  //         fieldName = convertToSnakeCase(key, '');
  //       }
        
  //       console.log(`Processing field: ${key} -> ${fieldName}, value:`, value);
        
  //       if (value instanceof File) {
  //         formData.append(fieldName, value);
  //         console.log(`Added file: ${fieldName}`, value.name);
  //       } else if (value instanceof Date) {
  //         formData.append(fieldName, value.toISOString());
  //       } else if (value !== undefined && value !== null && value !== '') {
  //         formData.append(fieldName, String(value));
  //       }
  //     });
      
  //     // Log FormData contents
  //     console.log('FormData contents:');
  //     for (let [key, value] of formData.entries()) {
  //       console.log(`${key}:`, value);
  //     }
      
  //     onSave(formData as any);
  //   } else {
  //     // Handle regular JSON submission
  //     const payload: Record<string, any> = {};
      
  //     Object.entries(values).forEach(([key, value]) => {
  //       let fieldName: string;
        
  //       if (key.startsWith(convertToCamelCase(customFieldGroupName))) {
  //         // For custom fields, convert back to proper format
  //         const customFieldName = key.replace(convertToCamelCase(customFieldGroupName) + '.', '');
  //         fieldName = `${customFieldGroupName}.${customFieldName}`;
  //       } else {
  //         // For regular fields, use snake_case conversion
  //         fieldName = convertToSnakeCase(key, '');
  //       }
        
  //       if (value instanceof Date) {
  //         payload[fieldName] = value.toISOString();
  //       } else if (value !== undefined && value !== null && value !== '') {
  //         payload[fieldName] = value;
  //       }
  //     });
      
  //     console.log('JSON payload:', payload);
  //     onSave(payload as Omit<Activity, 'id'>);
  //   }
  // };

  // NEW CODE V3
  // const onSubmit = async (values: z.infer<typeof formSchema>) => {
  //   const hasFiles = Object.values(values).some(value => value instanceof File);
  
  //   if (hasFiles) {
  //     const formData = new FormData();
    
  //     Object.entries(values).forEach(([key, value]) => {
  //       const fieldName = convertToSnakeCase(key, customFieldGroupName);
      
  //       if (value instanceof File) {
  //         formData.append(fieldName, value);
  //       } else if (value instanceof Date) {
  //         // Format date to local timezone DD-MM-YYYY HH:MM:SS
  //         const year = value.getFullYear();
  //         const month = String(value.getMonth() + 1).padStart(2, '0');
  //         const day = String(value.getDate()).padStart(2, '0');
  //         const hours = String(value.getHours()).padStart(2, '0');
  //         const minutes = String(value.getMinutes()).padStart(2, '0');
  //         const seconds = String(value.getSeconds()).padStart(2, '0');
  //         const localDateTime = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  //         formData.append(fieldName, localDateTime);

  //       } else if (value !== undefined && value !== null && value !== '') {
  //         formData.append(fieldName, String(value));
  //       }
  //     });
    
  //     // Call onSave with FormData instead of uploadFile
  //     onSave(formData as any);
  //   } else {
  //       // Handle regular JSON submission
  //       const payload = Object.fromEntries(
  //         Object.entries(values).map(([key, value]) => {
  //         const fieldName = convertToSnakeCase(key, customFieldGroupName);
  //         if (value instanceof Date) {
  //           // Format date to local timezone YYYY-MM-DD HH:MM
  //           const year = value.getFullYear();
  //           const month = String(value.getMonth() + 1).padStart(2, '0');
  //           const day = String(value.getDate()).padStart(2, '0');
  //           const hours = String(value.getHours()).padStart(2, '0');
  //           const minutes = String(value.getMinutes()).padStart(2, '0');
  //           return [fieldName, `${year}-${month}-${day} ${hours}:${minutes}`];

  //         }
  //         return [fieldName, value];
  //       })
  //     )
  //     onSave(payload as Omit<Activity, 'id'>);
  //   }
  // }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 min-h-full">
        <div className="flex gap-4">
          {/* Source / Added By */}
          <FormField
            control={form.control}
            name="sourceContactId"

            render={({ field }) => (
              <FormItem className="flex-1/3">
                <FormLabel>
                  Added By<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  {initialData?.["source_contact_id"] ? (
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/contacts/${initialData["source_contact_id"]}`}
                        className="text-blue-500 hover:text-inherit"
                      >
                        {initialData["source.display_name"]}
                      </Link>
                      <Input type="hidden" {...field} value={String(initialData["source_contact_id"])} />
                    </div>
                  ) : (
                    <ContactCombobox value={String(field.value)} onChange={field.onChange} />

                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Target */}
          <FormField
            control={form.control}
            name="targetContactId"
            render={({ field }) => (
              <FormItem className="flex-1/3">
                <FormLabel>With Contact</FormLabel>
                <FormControl>
                  <ContactCombobox value={Array.isArray(field.value) ? field.value[0] : field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Assignee */}
          <FormField
            control={form.control}
            name="assigneeContactId"
            render={({ field }) => (
              <FormItem className="flex-1/3">
                <FormLabel>Assigned to</FormLabel>
                <FormControl>
                  <ContactCombobox value={Array.isArray(field.value) ? field.value[0] : field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          {/* Subject */}
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input placeholder="Activity subject" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          {/* Date & Time */}
          <FormField
            control={form.control}
            name="activityDateTime"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>
                  Date & Time<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    displayFormat={{ hour12: 'MMMM d, yyyy hh:mm aa' }}
                    hourCycle={12}
                    granularity="minute"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Duration */}
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 60" type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="statusId$name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>
                  Activity Status<span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value as string}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {statusQuery.data?.map((s) => (
                          <SelectItem key={s.id} value={s.label}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Details */}
        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Details</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter detailed description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <CustomFieldGroup
          title={activityTypeName}
          fields={customFields}
          control={form.control}
          customFieldGroup={customFieldGroupName}
        />

        <Button
          type="button"
          disabled={isPending}
          className="hover:cursor-pointer"
          onClick={form.handleSubmit(onSubmit)}
        >
          {isPending ? <LoadingSpinner /> : "Save"}
        </Button>
      </form>
    </Form>
  );
}
