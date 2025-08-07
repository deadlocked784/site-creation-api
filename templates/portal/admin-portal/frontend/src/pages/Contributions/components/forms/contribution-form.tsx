import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../../components/ui/form'
import { Input } from '../../../../components/ui/input'
import { Button } from '../../../../components/ui/button'
import { useQuery } from '@tanstack/react-query'
import SkeletonForm from '../../../../components/forms/skeleton-form'
import { getFinancialTypes } from '@/services/financial-types'
import { ContactCombobox } from '../../../../components/fields/combobox/contact-combobox'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import type { Contribution } from '@/types/contribution'
import { DateTimePicker } from '@/components/common/datetime-picker'
import { Link } from 'react-router-dom'
import { getOptionValues } from '@/services/option-values'

const formSchema = z.object({
  contributor: z.string(),
  financialType: z.string(),
  totalAmount: z
    .string()
    .nonempty({ message: 'Required' })
    .refine((val) => !isNaN(parseFloat(val)) && isFinite(Number(val)), { message: 'Must be a valid number' })
    .refine((val) => parseFloat(val) > 0, { message: 'Amount must be greater than zero' }),
  contributionSource: z.string().optional(),
  contributionStatus: z.string(),
  contributionDate: z.date(),
  paymentMethod: z.string(),
})

type FormValues = z.infer<typeof formSchema>

/**
 * Map contribution form values to the API contribution format
 */

function mapFormValuesToContribution(values: FormValues): Omit<Contribution, 'id'> {
  return {
    contact_id: Number(values.contributor),
    financial_type_id: Number(values.financialType),
    payment_instrument_id: Number(values.paymentMethod),
    receive_date: values.contributionDate.toISOString(), 
    total_amount: Number(values.totalAmount),
    source: values.contributionSource,
    contribution_status_id: Number(values.contributionStatus),
  };
}

/**
 * Map API contribution data to form values for editing
 */
function mapContributionToFormValues(contribution: Contribution | Partial<Contribution>): FormValues {
  return {
    contributor: String(contribution.contact_id),
    financialType: String(contribution.financial_type_id),
    totalAmount: String(contribution.total_amount),
    contributionSource: contribution.source || '',
    contributionStatus: String(contribution.contribution_status_id),
    contributionDate: contribution.receive_date ? new Date(contribution.receive_date) : new Date(),
    paymentMethod: String(contribution.payment_instrument_id),
  }
}

interface ContributionFormProps {
  initialData?: Contribution | Partial<Contribution>
  isPending: boolean
  onSave: (variables: Omit<Contribution, 'id'>) => void
}

export default function ContributionForm(props: ContributionFormProps) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: props.initialData
      ? mapContributionToFormValues(props.initialData)
      : {
          contributionDate: new Date(),
        },
  })

  const finTypeQuery = useQuery({
    queryKey: ['financialTypes'],
    queryFn: getFinancialTypes,
  })

  const conStatusQuery = useQuery({
    queryKey: ['contributionStatuses'],
    queryFn: () => getOptionValues({ optionGroupName: 'contribution_status' }),
  })

  const payMethQuery = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: () => getOptionValues({ optionGroupName: 'payment_instrument' }),
  })

  if (finTypeQuery.isError) {
    return <div>Error loading financial types</div>
  } else if (conStatusQuery.isError) {
    return <div>Error loading contribution statuses</div>
  } else if (payMethQuery.isError) {
    return <div>Error loading payment methods</div>
  }

  if (finTypeQuery.isLoading || conStatusQuery.isLoading || payMethQuery.isLoading) {
    return <SkeletonForm />
  }

  function onSubmit(values: FormValues) {
    const payload = mapFormValuesToContribution(values)
    props.onSave(payload)
  }

  return (
    <Form {...form}>
      <div className='grid grid-cols-2 gap-6'>
        <FormField
          control={form.control}
          name='contributor'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Contributor <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                {props.initialData?.contact_id ? (
                  <div className='flex items-center gap-2'>
                    <Link to={`/contacts/${props.initialData.contact_id}`} className='text-blue-500 hover:text-inherit'>
                      {props.initialData['contact.display_name']}
                    </Link>
                    {/* Hidden input still used for form submission */}
                    <Input type='hidden' {...field} value={String(props.initialData.contact_id)} />
                  </div>
                ) : (
                  <ContactCombobox value={field.value} onChange={field.onChange} />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='financialType'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Financial Type <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className='w-auto' {...field}>
                    <SelectValue placeholder='Select' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Financial Type</SelectLabel>
                      {finTypeQuery.data?.map((type) => (
                        <SelectItem key={type.id} value={String(type.id)}>
                          {type.name}
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

        <FormField
          control={form.control}
          name='totalAmount'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Total Amount <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input type='number' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='paymentMethod'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Payment Method <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className='w-auto' {...field}>
                    <SelectValue placeholder='Select' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Payment Method</SelectLabel>
                      {payMethQuery.data?.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
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

        <FormField
          control={form.control}
          name='contributionStatus'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Contribution Status <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className='w-auto' {...field}>
                    <SelectValue placeholder='Select' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Contribution Status</SelectLabel>
                      {conStatusQuery.data?.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
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

        <FormField
          control={form.control}
          name='contributionDate'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Contribution Date <span className='text-red-500'>*</span>
              </FormLabel>
              <FormControl>
                <DateTimePicker
                  value={field.value}
                  onChange={field.onChange}
                  displayFormat={{ hour12: 'MMMM d, yyyy hh:mm aa' }}
                  hourCycle={12}
                  granularity='minute'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='contributionSource'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contribution Source</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='button'
          className='col-span-2 hover:cursor-pointer'
          disabled={props.isPending}
          onClick={form.handleSubmit(onSubmit)}
        >
          {props.isPending ? <LoadingSpinner /> : 'Save'}
        </Button>
      </div>
    </Form>
  )
}
