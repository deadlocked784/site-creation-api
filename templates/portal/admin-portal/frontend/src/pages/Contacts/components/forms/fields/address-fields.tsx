import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Control, FieldPath } from 'react-hook-form'

export function AddressFields<T extends Record<string, string | undefined | null>>({
  control,
}: {
  control: Control<T>
}) {
  return (
    <>
      <h2 className='col-span-full text-lg font-semibold'>Address</h2>
      <FormField
        control={control}
        name={'addressPrimary_postalCode' as FieldPath<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Postal Code</FormLabel>
            <FormControl>
              <Input placeholder='123456' maxLength={6} {...field} value={field.value || undefined} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={'addressPrimary_supplementalAddress1' as FieldPath<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Floor-Unit</FormLabel>
            <FormControl>
              <Input placeholder='#01-01' {...field} value={field.value || undefined} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={'addressPrimary_streetAddress' as FieldPath<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <Textarea placeholder='Enter your address' {...field} value={field.value || undefined} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
