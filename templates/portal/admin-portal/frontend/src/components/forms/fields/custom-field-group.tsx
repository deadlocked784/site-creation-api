import { useMemo } from 'react'
import { useOptionValues } from '@/hooks/use-option-values'
import { useCountries } from '@/hooks/use-countries'
import { useEntityReferences } from '@/hooks/use-entity-references'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import type { Control } from 'react-hook-form'
import { FieldRenderer } from './field-renderer'
import type { CustomField } from '@/types/custom-fields'

interface Props<T extends Record<string, string | number | boolean | undefined>> {
  title?: string
  fields: CustomField[]
  control: Control<T>
  customFieldGroup: string
}

export function CustomFieldGroup<T extends Record<string, string | number | boolean | undefined>>({
  title,
  fields,
  control,
  customFieldGroup,
}: Props<T>) {
  const dependencies = useMemo(() => {
    if (!fields) return { optionGroupIds: [], needsCountries: false, entityReferences: [] }

    const optionGroupIds = new Set<number>()
    let needsCountries = false
    const entityReferences: Array<{ type: string; filter?: string }> = []

    for (const field of fields) {
      // Collect option group IDs
      if (field.option_group_id) {
        optionGroupIds.add(field.option_group_id)
      }

      // Check for country fields
      if (!needsCountries && field.data_type?.toLowerCase() === 'country') {
        needsCountries = true
      }

      // Collect entity references
      if (field.data_type?.toLowerCase() === 'entityreference' && field.fk_entity) {
        entityReferences.push({
          type: field.fk_entity,
          filter: field.filter,
        })
      }
    }

    return {
      optionGroupIds: Array.from(optionGroupIds),
      needsCountries,
      entityReferences,
    }
  }, [fields])

  // Fetch option values
  const {
    isLoading: isLoadingOptions,
    isError: isErrorOptions,
    getOptionsForField,
  } = useOptionValues(dependencies.optionGroupIds)

  // Fetch countries if needed
  const {
    data: countries,
    isLoading: isLoadingCountries,
    isError: isErrorCountries,
  } = useCountries(dependencies.needsCountries)

  // Fetch entity references
  const {
    isLoading: isLoadingEntityReferences,
    isError: isErrorEntityReferences,
    getEntityOptionsForField,
  } = useEntityReferences(dependencies.entityReferences)

  const renderedFields = useMemo(() => {
    if (!fields) return []

    return fields.map((field) => {
      const options = field.option_group_id ? getOptionsForField(field.option_group_id) : []
      const entityOptions =
        field.data_type?.toLowerCase() === 'entityreference' && field.fk_entity
          ? getEntityOptionsForField(field.fk_entity)
          : []

      return (
        <FieldRenderer
          key={field.id}
          field={field}
          options={options}
          countries={countries}
          entityOptions={entityOptions}
          control={control}
          customFieldGroup={customFieldGroup}
        />
      )
    })
  }, [fields, control, getOptionsForField, countries, getEntityOptionsForField, customFieldGroup])

  const isLoading = isLoadingOptions || isLoadingCountries || isLoadingEntityReferences
  const isError = isErrorOptions || isErrorCountries || isErrorEntityReferences

  if (!fields || fields.length === 0) {
    return null
  }

  if (isLoading) {
    return (
      <div className='col-span-full'>
        <LoadingSpinner />
      </div>
    )
  }

  if (isError) {
    return <p className='text-red-500'>Failed to load custom fields. Please try again later.</p>
  }

  return (
    <>
      {title && <h2 className='col-span-full text-lg font-semibold'>{title}</h2>}
      {renderedFields.length > 0 ? renderedFields : null}
    </>
  )
}
