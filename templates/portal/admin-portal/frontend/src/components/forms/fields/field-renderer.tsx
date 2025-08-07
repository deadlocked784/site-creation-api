import type { CustomField } from '@/types/custom-fields'
import type { OptionValue } from '@/types/option-value'
import type { Entity } from '@/types/entities'
import {
  TextField,
  TextAreaField,
  SelectField,
  RadioField,
  CheckboxField,
  FileField,
  DateField,
  LinkField,
  AutocompleteField,
  MoneyField,
} from './custom-fields'
import type { Country } from '@/types/country'
import type { Control } from 'react-hook-form'
import { convertToCamelCase } from '@/lib/case-convertor'

interface Props<T extends Record<string, string | number | boolean | undefined>> {
  field: CustomField
  options: OptionValue[]
  countries?: Country[]
  entityOptions: Entity[]
  control: Control<T>
  customFieldGroup?: string
}

export function FieldRenderer<T extends Record<string, string | number | boolean | undefined>>({
  field,
  options,
  countries,
  entityOptions,
  control,
  customFieldGroup = 'Additional_Donor_Particulars',
  
}: Props<T>) {
  // Convert field name to match the form schema naming convention
  const fieldName = convertToCamelCase(`${customFieldGroup}.${field.name}`)
  const required = field.is_required
  const help = (field.help_pre ? field.help_pre : '') + (field.help_post ? field.help_post : '')

  // Handle money fields with text input type
  if (field.data_type?.toLowerCase() === 'money' && field.html_type.toLowerCase() === 'text') {
    return <MoneyField field={field} fieldName={fieldName} required={required} help={help} control={control} />
  }

  // Handle other field types
  switch (field.html_type.toLowerCase()) {
    case 'textarea':
      return <TextAreaField field={field} fieldName={fieldName} required={required} help={help} control={control} />

    case 'select':
      return (
        <SelectField
          field={field}
          fieldName={fieldName}
          required={required}
          help={help}
          options={options}
          countries={countries}
          control={control}
        />
      )

    case 'radio':
      return (
        <RadioField
          field={field}
          fieldName={fieldName}
          required={required}
          help={help}
          options={options}
          control={control}
        />
      )

    case 'checkbox':
      return (
        <CheckboxField
          field={field}
          fieldName={fieldName}
          required={required}
          help={help}
          options={options}
          control={control}
        />
      )

    case 'file':
      return <FileField field={field} fieldName={fieldName} required={required} help={help} control={control} />

    case 'select date':
      return <DateField field={field} fieldName={fieldName} required={required} help={help} control={control} />

    case 'link':
      return <LinkField field={field} fieldName={fieldName} required={required} help={help} control={control} />

    case 'autocomplete-select': {
      const comboType =
        field.data_type?.toLowerCase() === 'entityreference' && field.fk_entity
          ? field.fk_entity.replace(/_/g, ' ')
          : field.label

      return (
        <AutocompleteField
          field={field}
          fieldName={fieldName}
          required={required}
          help={help}
          data={entityOptions}
          comboType={comboType}
          control={control}
        />
      )
    }

    default:
      return <TextField field={field} fieldName={fieldName} required={required} help={help} control={control} />
  }
}
