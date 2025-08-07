import { Combobox } from '@/components/common/combo-box'
import { CustomTooltip } from '@/components/common/custom-tooltip'
import { DateTimePicker } from '@/components/common/datetime-picker'
import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Country } from '@/types/country'
import type { CustomField } from '@/types/custom-fields'
import type { Entity } from '@/types/entities'
import type { OptionValue } from '@/types/option-value'
import type { Control, FieldPath } from 'react-hook-form'

interface BaseFieldProps<T extends Record<string, string | number | boolean | undefined>> {
  control: Control<T>
  field: CustomField
  fieldName: string
  required: boolean
  help: string
}

export function MoneyField<T extends Record<string, string | number | boolean | undefined>>({
  field,
  fieldName,
  required,
  help,
  control,
}: BaseFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={fieldName as FieldPath<T>}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>
            {field.label}
            {required && <span className='text-red-500'> *</span>}
            {help && <CustomTooltip content={help} />}
          </FormLabel>
          <FormControl>
            <div className='flex items-center rounded-md border p-2'>
              <span className='text-muted-foreground text-sm'>$</span>
              <Input
                {...formField}
                className='ml-2 h-auto border-none p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0'
                type='number'
                step='0.01'
                min='0'
                disabled={field.is_view}
                value={typeof formField.value === 'number' ? formField.value : ''}
                onChange={(e) => formField.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function TextAreaField<T extends Record<string, string | number | boolean | undefined>>({
  field,
  fieldName,
  required,
  help,
  control,
}: BaseFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={fieldName as FieldPath<T>}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>
            {field.label}
            {required && <span className='text-red-500'> *</span>}
            {help && <CustomTooltip content={help} />}
          </FormLabel>
          <FormControl>
            <Textarea
              {...formField}
              value={typeof formField.value === 'string' ? formField.value : ''}
              disabled={field.is_view}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

interface SelectFieldProps<T extends Record<string, string | number | boolean | undefined>> extends BaseFieldProps<T> {
  options: OptionValue[]
  countries?: Country[]
}

export function SelectField<T extends Record<string, string | number | boolean | undefined>>({
  field,
  fieldName,
  required,
  help,
  control,
  options,
  countries,
}: SelectFieldProps<T>) {
  return (
    <div className='space-y-4'>
      <FormField
        control={control}
        name={fieldName as FieldPath<T>}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>
              {field.label}
              {required && <span className='text-red-500'> *</span>}
              {help && <CustomTooltip content={help} />}
            </FormLabel>
            <Select
              onValueChange={formField.onChange}
              value={
                typeof formField.value === 'string' || typeof formField.value === 'number'
                  ? String(formField.value)
                  : undefined
              }
              disabled={field.is_view}
            >
              <FormControl>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select an option' />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {field.data_type?.toLowerCase() === 'country' && countries
                  ? countries.map((country) => (
                      <SelectItem key={country.id} value={country.id.toString()}>
                        {country.name}
                      </SelectItem>
                    ))
                  : options.map((option) => (
                      <SelectItem key={option.id} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export function RadioField<T extends Record<string, any>>({
  field,
  fieldName,
  required,
  help,
  options,
  control,
}: SelectFieldProps<T>) {
  const isBool = field.data_type.toLowerCase() === "boolean"

  return (
    <FormField
      control={control}
      name={fieldName as FieldPath<T>}
      render={({ field: formField }) => (
        <FormItem className='space-y-3'>
          <FormLabel>
            {field.label}
            {required && <span className='text-red-500'> *</span>}
            {help && <CustomTooltip content={help} />}
          </FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={(value) =>
                formField.onChange(isBool ? value === "true" : value)
              }
              value={
                isBool
                  ? String(formField.value)
                  : typeof formField.value === 'string' || typeof formField.value === 'number'
                  ? String(formField.value)
                  : undefined
              }
              disabled={field.is_view}
              className='flex flex-col space-y-1'
            >
              {isBool
                ? // 1) only show a Yes/No pair for booleans
                  (["true", "false"] as const).map((v) => (
                    <div key={v} className="flex items-center space-x-2">
                      <RadioGroupItem value={v} id={`${fieldName}-${v}`} />
                      <Label htmlFor={`${fieldName}-${v}`}>
                        {v === "true" ? "Yes" : "No"}
                      </Label>
                    </div>
                  ))
                : // otherwise fall back to your normal options
                  options.map((option) => (
                    <div key={option.id} className='flex items-center space-x-2'>
                      <RadioGroupItem
                        value={String(option.value)}
                        id={`${fieldName}-${option.id}`}
                      />
                      <Label htmlFor={`${fieldName}-${option.id}`}>
                        {option.label}
                      </Label>
                    </div>
                  ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function CheckboxField<T extends Record<string, string | number | boolean | undefined>>({
  field,
  fieldName,
  required,
  help,
  options,
  control,
}: SelectFieldProps<T>) {
  return (
    <div className='space-y-3'>
      <FormLabel>
        {field.label}
        {required && <span className='text-red-500'> *</span>}
        {help && <CustomTooltip content={help} />}
      </FormLabel>
      {options.map((option) => (
        <FormField
          control={control}
          key={`${field.id}-${option.id}`}
          name={`${fieldName}[${option.value}]` as FieldPath<T>}
          render={({ field: formField }) => (
            <FormItem className='flex flex-row items-start space-y-1 space-x-2'>
              <FormControl>
                <Checkbox
                  checked={typeof formField.value === 'boolean' ? formField.value : false}
                  onCheckedChange={formField.onChange}
                  disabled={field.is_view}
                />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel>{option.label}</FormLabel>
              </div>
            </FormItem>
          )}
        />
      ))}
      <FormMessage />
    </div>
  )
}

export function FileField<T extends Record<string, string | number | boolean | undefined>>({
  field,
  fieldName,
  required,
  help,
  control,
}: BaseFieldProps<T>) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string | undefined) => void) => {
    const file = e.target.files?.[0]
    if (file) {
      // Convert file to base64 data URL to store as string
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result
        if (typeof result === 'string') {
          onChange(result) // This will be a data URL string like "data:image/png;base64,..."
        }
      }
      reader.readAsDataURL(file)
    } else {
      onChange(undefined)
    }
  }

  return (
    <FormField
      control={control}
      name={fieldName as FieldPath<T>}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>
            {field.label}
            {required && <span className='text-red-500'> *</span>}
            {help && <CustomTooltip content={help} />}
          </FormLabel>
          <FormControl>
            <Input 
              type='file' 
              disabled={field.is_view} 
              onChange={(e) => handleFileChange(e, formField.onChange)}
              accept="image/*" // Add accept attribute for file types if needed
            />
          </FormControl>
          {formField.value && typeof formField.value === 'string' && formField.value.startsWith('data:') && (
            <div className='text-muted-foreground mt-2 text-sm'>
              Current file ID: {formField.value}
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function DateField<T extends Record<string, string | number | boolean | undefined>>({
  field,
  fieldName,
  required,
  help,
  control,
}: BaseFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={fieldName as FieldPath<T>}
      render={({ field: formField }) => (
        <FormItem className='flex flex-col'>
          <FormLabel>
            {field.label}
            {required && <span className='text-red-500'> *</span>}
            {help && <CustomTooltip content={help} />}
          </FormLabel>
          <FormControl>
            <DateTimePicker
              value={
                formField.value && (typeof formField.value === 'string' || typeof formField.value === 'number')
                  ? new Date(formField.value)
                  : undefined
              }
              onChange={formField.onChange}
              // onChange={(date) => {
              //   if (date) {
              //     // Format the date in local timezone
              //     const year = date.getFullYear();
              //     const month = String(date.getMonth() + 1).padStart(2, '0');
              //     const day = String(date.getDate()).padStart(2, '0');
              //     const hours = String(date.getHours()).padStart(2, '0');
              //     const minutes = String(date.getMinutes()).padStart(2, '0');
              //     const seconds = String(date.getSeconds()).padStart(2, '0');
                  
              //     const localDateString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
              //     formField.onChange(localDateString);
              //   } else {
              //     formField.onChange(undefined);
              //   }
              // }}
              hourCycle={12}
              granularity={field.time_format ? 'minute' : 'day'}
              disabled={field.is_view}
              placeholder={field.time_format ? 'Select date and time' : 'Select date'}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function LinkField<T extends Record<string, string | number | boolean | undefined>>({
  field,
  fieldName,
  required,
  help,
  control,
}: BaseFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={fieldName as FieldPath<T>}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>
            {field.label}
            {required && <span className='text-red-500'> *</span>}
            {help && <CustomTooltip content={help} />}
          </FormLabel>
          <FormControl>
            <Input
              {...formField}
              value={typeof formField.value === 'string' ? formField.value : ''}
              type='url'
              placeholder='https://'
              disabled={field.is_view}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

interface AutocompleteFieldProps<T extends Record<string, string | number | boolean | undefined>>
  extends BaseFieldProps<T> {
  data: Entity[]
  comboType: string
}

export function AutocompleteField<T extends Record<string, string | number | boolean | undefined>>({
  field,
  fieldName,
  required,
  help,
  control,
  data,
  comboType,
}: AutocompleteFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={fieldName as FieldPath<T>}
      render={({field: formField}) => (
        <FormItem>
          <FormLabel>
            {field.label}
            {required && <span className='text-red-500'> *</span>}
            {help && <CustomTooltip content={help} />}
          </FormLabel>
          <FormControl>
            <div className='w-full'>
              <Combobox
                data={data}
                type={comboType}
                disabled={field.is_view}
                value={
                  typeof formField.value === 'string' || typeof formField.value === 'number'
                    ? formField.value
                    : undefined
                }
                onChange={formField.onChange}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function TextField<T extends Record<string, string | number | boolean | undefined>>({
  field,
  fieldName,
  required,
  help,
  control,
}: BaseFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={fieldName as FieldPath<T>}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>
            {field.label}
            {required && <span className='text-red-500'> *</span>}
            {help && <CustomTooltip content={help} />}
          </FormLabel>
          <FormControl>
            <Input
              {...formField}
              value={
                typeof formField.value === 'string' || typeof formField.value === 'number'
                  ? String(formField.value)
                  : ''
              }
              disabled={field.is_view}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
