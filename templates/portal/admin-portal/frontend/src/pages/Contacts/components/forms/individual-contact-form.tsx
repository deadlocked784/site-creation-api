import { LoadingSpinner } from '@/components/common/loading-spinner'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { IndividualContact } from '@/types/contact'
import type { CustomField } from '@/types/custom-fields'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useEffect, useMemo } from 'react'
import { useCustomFields } from '@/hooks/use-custom-fields'
import { useGroups } from '@/hooks/use-groups'
import { useTags } from '@/hooks/use-tags'
import z from 'zod'
import { AddressFields } from './fields/address-fields'
import { ContactFields } from './fields/contact-fields'
import { CustomFieldGroup } from '@/components/forms/fields/custom-field-group'
import { Separator } from '@/components/ui/separator'
import { convertToCamelCase, convertToSnakeCase } from '@/lib/case-convertor'
import { createFormSchemaWithCustomFields } from '@/lib/form-schema-builder'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const individualContactBaseSchema = z.object({
  contactType: z.literal('Individual'),
  firstName: z.string().min(1, 'Full name is required'),
  lastName: z.string().min(1, 'Preferred name is required'),
  emailPrimary_email: z.string().email().or(z.literal('')).optional().nullable(),
  phonePrimary_phone: z.string().optional().nullable(),
  birthDate: z.coerce.date().optional().nullable(),
  externalIdentifier: z.string().optional().nullable(),
  addressPrimary_postalCode: z.string().optional().nullable(),
  addressPrimary_floorUnit: z.string().optional().nullable(),
  addressPrimary_streetAddress: z.string().optional().nullable(),
  group_contact_group_id: z.string().optional().nullable(),
  tag_id: z.string().optional().nullable(),
})

const getBaseDefaultValues = (initialData?: IndividualContact) => {
  return initialData
    ? Object.fromEntries(Object.entries(initialData).map(([key, value]) => [convertToCamelCase(key), value]))
    : {
      contactType: 'Individual' as const,
      firstName: '',
      lastName: '',
      emailPrimary_email: undefined,
      phonePrimary_phone: undefined,
      birthDate: undefined,
      externalIdentifier: undefined,
      addressPrimary_postalCode: undefined,
      addressPrimary_floorUnit: undefined,
      addressPrimary_streetAddress: undefined,
      group_contact_group_id: undefined,
      tag_id: undefined,
    }
}

const getCompleteDefaultValues = (
  initialData: IndividualContact | undefined,
  customFields: CustomField[],
  customFieldGroupName: string
) => {
  const defaultValues = getBaseDefaultValues(initialData)
  customFields.forEach((field) => {
    const fieldName = convertToCamelCase(`${customFieldGroupName}.${field.name}`)
    if (!(fieldName in defaultValues)) {
      defaultValues[fieldName] = undefined
    }
  })
  return defaultValues
}

interface Props {
  initialData?: IndividualContact
  isPending: boolean
  onSave: (variables: Omit<IndividualContact, 'id'>) => void
}

export default function IndividualContactForm({ initialData, isPending, onSave }: Props) {
  const customFieldGroupName = 'Additional_Donor_Particulars'
  const { data: customFields = [], isLoading: isLoadingFields } = useCustomFields(customFieldGroupName)
  const { data: groups = [], isLoading: isGroupsLoading } = useGroups()
  const { data: tags = [], isLoading: isTagsLoading } = useTags()


  useEffect(() => {
    console.log('Tags fetched from useTags:', tags)
    console.log('Tags loading status:', isTagsLoading)
  }, [tags, isTagsLoading])

  const formSchema = useMemo(
    () => createFormSchemaWithCustomFields(individualContactBaseSchema, customFields, customFieldGroupName),
    [customFields]
  )

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: getBaseDefaultValues(initialData),
  })

  useEffect(() => {
    if (customFields && !isLoadingFields) {
      const defaultValues = getCompleteDefaultValues(initialData, customFields, customFieldGroupName)
      form.reset(defaultValues)
    }
  }, [customFields, isLoadingFields, initialData, customFieldGroupName, form])

 
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload = Object.fromEntries(
      Object.entries(values).map(([key, value]) => {
        if (key === 'tag_id') return [key, value];
        return [convertToSnakeCase(key, customFieldGroupName), value];
      })
    )



    onSave(payload as Omit<IndividualContact, 'id'>)
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='grid items-start gap-5 md:grid-cols-3'>
        <h2 className='col-span-full mt-2 text-lg font-semibold'>Individual Information</h2>

        <FormField
          control={form.control}
          name='firstName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Full Name <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder='John Doe' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='lastName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Preferred Name <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder='John' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='externalIdentifier'
          render={({ field }) => (
            <FormItem>
              <FormLabel>NRIC</FormLabel>
              <FormControl>
                <Input placeholder='S1234567D' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ContactFields control={form.control} />

        <FormField
          control={form.control}
          name='birthDate'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of birth</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                    >
                      {field.value ? format(field.value, 'dd MMMM yyyy') : <span>Pick a date</span>}
                      <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    captionLayout='dropdown'
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='group_contact_group_id'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value?.toString() ?? ''}
                disabled={isGroupsLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a group' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='tag_id'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tag</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value?.toString() ?? ''}
                disabled={isTagsLoading || tags.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isTagsLoading ? 'Loading tags...' : 'Select a tag'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tags.map((tag) =>
                    tag.id ? (
                      <SelectItem key={tag.id} value={tag.id.toString()}>
                        {tag.label}
                      </SelectItem>
                    ) : null
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className='col-span-full my-2' />
        <AddressFields control={form.control} />

        <Separator className='col-span-full my-2' />
        <CustomFieldGroup
          title='Additional Particulars'
          fields={customFields}
          control={form.control}
          customFieldGroup={customFieldGroupName}
        />

        <Button type='submit' disabled={isPending || isLoadingFields} className='col-span-full'>
          {isPending ? <LoadingSpinner /> : 'Save'}
        </Button>
      </form>
    </Form>
  )
}

