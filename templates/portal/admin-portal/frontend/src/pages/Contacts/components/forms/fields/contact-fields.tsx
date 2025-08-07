import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { Control, FieldPath } from 'react-hook-form'

export function ContactFields<T extends Record<string, string | undefined | null>>({
  control,
}: {
  control: Control<T>
}) {
  return (
    <>
      <FormField
        control={control}
        name={'emailPrimary_email' as FieldPath<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder='john.doe@example.com' type='email' {...field} value={field.value || undefined} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={'phonePrimary_phone' as FieldPath<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <Input placeholder='81234567' {...field} type='tel' value={field.value || undefined} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
