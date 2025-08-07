import { LoadingSpinner } from '@/components/common/loading-spinner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { OrganizationContact } from '@/types/contact'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { convertToCamelCase, convertToSnakeCase } from '@/lib/case-convertor'
import { AddressFields } from './fields/address-fields'
import { ContactFields } from './fields/contact-fields'
import { Separator } from '@/components/ui/separator'
import { useGroups } from '@/hooks/use-groups'
import { useTags } from '@/hooks/use-tags'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const organizationContactBaseSchema = z.object({
  contactType: z.literal('Organization'),
  organizationName: z.string().min(1, 'Organization name is required'),
  externalIdentifier: z.string().optional().nullable(),
  emailPrimary_email: z.string().email().or(z.literal('')).optional().nullable(),
  phonePrimary_phone: z.string().optional().nullable(),
  addressPrimary_postalCode: z.string().optional().nullable(),
  addressPrimary_supplementalAddress1: z.string().optional().nullable(),
  addressPrimary_streetAddress: z.string().optional().nullable(),
  group_contact_group_id: z.string().optional().nullable(),
  tag_id: z.string().optional().nullable(),
})

type FormValues = z.infer<typeof organizationContactBaseSchema>

const getDefaultValues = (initialData?: OrganizationContact): FormValues => {
  return initialData
    ? (Object.fromEntries(
        Object.entries(initialData).map(([key, value]) => [convertToCamelCase(key), value])
      ) as FormValues)
    : {
        contactType: 'Organization' as const,
        organizationName: '',
        externalIdentifier: undefined,
        emailPrimary_email: undefined,
        phonePrimary_phone: undefined,
        addressPrimary_postalCode: undefined,
        addressPrimary_supplementalAddress1: undefined,
        addressPrimary_streetAddress: undefined,
        group_contact_group_id: undefined,
        tag_id: undefined,
      }
}

interface Props {
  initialData?: OrganizationContact
  isPending: boolean
  onSave: (variables: Omit<OrganizationContact, 'id'>) => void
}

export default function OrganizationContactForm({ initialData, isPending, onSave }: Props) {
  const form = useForm({
    resolver: zodResolver(organizationContactBaseSchema),
    defaultValues: getDefaultValues(initialData),
  })

  const { data: groups = [], isLoading: isGroupsLoading } = useGroups()
  const { data: tags = [], isLoading: isTagsLoading } = useTags()

  function onSubmit(values: FormValues) {
    const payload = Object.fromEntries(
      Object.entries(values).map(([key, value]) => {
        if (key === 'tag_id') return [key, value]
        return [convertToSnakeCase(key), value]
      })
    ) as Omit<OrganizationContact, 'id'>

    console.log('Payload:', payload)
    onSave(payload)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='grid items-start gap-5 md:grid-cols-3'>
        <h2 className='col-span-full mt-2 text-lg font-semibold'>Organization Information</h2>

        <FormField
          control={form.control}
          name='organizationName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Organization Name <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder='Acme Corp' {...field} />
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
              <FormLabel>External Identifier</FormLabel>
              <FormControl>
                <Input placeholder='201234567D' {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ContactFields control={form.control} />

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
                disabled={isTagsLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a tag' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id.toString()}>
                      {tag.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className='col-span-full my-2' />

        <AddressFields control={form.control} />

        <Button type='submit' disabled={isPending} className='col-span-full'>
          {isPending ? <LoadingSpinner /> : 'Save'}
        </Button>
      </form>
    </Form>
  )
}