import z from 'zod'
import type { CustomField } from '@/types/custom-fields'
import { convertToCamelCase } from '@/lib/case-convertor'

/**
 * Creates a dynamic form schema by extending a base schema with custom fields
 * @param baseSchema - The base Zod schema to extend
 * @param customFields - Array of custom fields to add to the schema
 * @param customFieldGroup - The custom field group name for field naming
 * @returns Extended Zod schema with custom fields
 */
export const createFormSchemaWithCustomFields = <T extends z.ZodRawShape>(
  baseSchema: z.ZodObject<T>,
  customFields: CustomField[] = [],
  customFieldGroup: string
) => {
  const customFieldSchema: Record<string, z.ZodTypeAny> = {}

  customFields.forEach((field) => {
    const fieldName = convertToCamelCase(`${customFieldGroup}.${field.name}`)
    let fieldSchema: z.ZodTypeAny

    switch (field.data_type?.toLowerCase()) {
      case 'entityreference':
      case 'money':
        if (field.is_required) {
          fieldSchema = z.coerce
            .number({
              required_error: `${field.label} is required`,
              invalid_type_error: `${field.label} must be a number`,
            })
            .min(0, `${field.label} must be 0 or greater`)
        } else {
          fieldSchema = z.coerce.number().optional().nullable()
        }
        break
      case 'date':
        if (field.is_required) {
          fieldSchema = z.coerce.date({
            required_error: `${field.label} is required`,
            invalid_type_error: `${field.label} must be a valid date`,
          })
        } else {
          fieldSchema = z.coerce.date().optional().nullable()
        }
        break
      case 'boolean':
        if (field.is_required) {
          fieldSchema = z.boolean({
            required_error: `${field.label} is required`,
            invalid_type_error: `${field.label} must be true or false`,
          })
        } else {
          fieldSchema = z.coerce.boolean().optional().nullable()
        }
        break
      case 'email':
        if (field.is_required) {
          fieldSchema = z.string().email({ message: `${field.label} must be a valid email` })
        } else {
          fieldSchema = z.string().email().or(z.literal('')).optional().nullable()
        }
        break
      case 'country':
        // Country fields can receive numbers (from DB) or strings (from UI)
        if (field.is_required) {
          fieldSchema = z
            .union([z.string(), z.number()])
            .transform((val) => String(val))
            .refine((val) => val !== '' && val !== '0', { message: `${field.label} is required` })
        } else {
          fieldSchema = z
            .union([z.string(), z.number()])
            .transform((val) => String(val))
            .optional()
            .nullable()
        }
        break
      case 'link':
        if (field.is_required) {
          fieldSchema = z.string().url({ message: `${field.label} must be a valid URL` })
        } else {
          fieldSchema = z.string().url().or(z.literal('')).optional().nullable()
        }
        break
      case 'file':
        // File fields expect a string (file path/URL) not a File object

        if (field.is_required) {
          fieldSchema = z.string().min(1, `${field.label} is required`)
          // fieldSchema = z.union([
          //   z.instanceof(File),
          //   z.string().min(1, `${field.label} is required`)
          // ]);
        } else {
          fieldSchema = z.string().optional().nullable()
          // fieldSchema = z.union([
        //     z.instanceof(File),
        //     z.string(),
        //     z.null(),
        //     z.undefined()
        // ]).optional().nullable()
        }
        break
      default:
        // This handles select fields and other string-based fields
        if (field.is_required) {
          fieldSchema = z.string().min(1, `${field.label} is required`)
        } else {
          fieldSchema = z.string().optional().nullable()
        }
    }

    customFieldSchema[fieldName] = fieldSchema
  })

  return baseSchema.extend(customFieldSchema)
}
