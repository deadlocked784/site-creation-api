# Form Schema Builder

A reusable utility for creating dynamic Zod schemas with custom fields support.

## Overview

The `createFormSchemaWithCustomFields` function allows you to extend any base Zod schema with custom fields, making it easy to create dynamic forms across different entities in your application.

## Usage

### Basic Usage

```typescript
import z from 'zod'
import { createFormSchemaWithCustomFields } from '@/lib/form-schema-builder'

// 1. Define your base schema
const baseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
})

// 2. Create schema with custom fields
const formSchema = createFormSchemaWithCustomFields(
  baseSchema,
  customFields, // Array of CustomField objects
  'Custom_Field_Group_Name'
)
```

### Real-world Examples

#### Individual Contact Form

```typescript
const individualContactBaseSchema = z.object({
  contactType: z.literal('Individual'),
  firstName: z.string().min(1, 'Full name is required'),
  lastName: z.string().min(1, 'Preferred name is required'),
  // ... other fields
})

const formSchema = useMemo(
  () => createFormSchemaWithCustomFields(individualContactBaseSchema, customFields, customFieldGroup),
  [customFields]
)
```

## Supported Custom Field Types

The function automatically handles validation for various custom field data types:

- **`string`** (default): Basic string validation with required field support
- **`number`/`money`**: Number validation with minimum value constraints
- **`date`**: Date validation with coercion
- **`boolean`**: Boolean validation
- **`email`**: Email format validation
- **`country`**: Handles both string and number values (for country IDs)
- **`link`**: URL format validation

## Custom Field Naming

Custom fields are automatically converted to camelCase format:

- Group: `Additional_Donor_Particulars`
- Field: `religion`
- Result: `additionalDonorParticulars.religion`

## Benefits

1. **Reusability**: Use the same logic across different forms
2. **Type Safety**: Full TypeScript support with proper type inference
3. **Validation**: Consistent validation rules for all custom field types
4. **Maintainability**: Single source of truth for custom field logic
5. **Flexibility**: Easy to extend with new field types

## Integration with Forms

```typescript
export function MyForm() {
  const customFieldGroup = 'My_Custom_Group'
  const { data: customFields = [] } = useCustomFields(customFieldGroup)

  const formSchema = useMemo(
    () => createFormSchemaWithCustomFields(myBaseSchema, customFields, customFieldGroup),
    [customFields]
  )

  const form = useForm({
    resolver: zodResolver(formSchema),
    // ... other options
  })

  // ... rest of form logic
}
```
