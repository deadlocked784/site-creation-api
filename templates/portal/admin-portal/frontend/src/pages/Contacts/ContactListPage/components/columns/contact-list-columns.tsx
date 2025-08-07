import { type ColumnDef, type Row } from '@tanstack/react-table'
import type { IndividualContact, OrganizationContact } from '@/types/contact'
import { Checkbox } from '@/components/ui/checkbox'
import { ActionsCell } from '@/components/common/actions-cell'
import { deleteContact, updateIndividualContact, updateOrganizationContact } from '@/services/contacts'
import IndividualContactForm from '@/pages/Contacts/components/forms/individual-contact-form'
import OrganizationContactForm from '@/pages/Contacts/components/forms/organization-contact-form'
import { DataTableColumnHeader } from '@/components/table/data-table-column-header'
import { Link } from 'react-router'

export const contactListColumns: ColumnDef<IndividualContact | OrganizationContact>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className='flex items-center justify-center'>
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className='flex items-center justify-center'>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // {
  //   id: 'name',
  //   header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
  //   accessorFn: (row) => {
  //     return row.contact_type === 'Organization' ? row.organization_name : `${row.first_name}`
  //   },
  // },
  {
  id: 'name',
  header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  accessorFn: (row) => {
    return row.contact_type === 'Organization' 
      ? row.organization_name 
      : row.first_name || '';
  },
  cell: ({ row }) => {
    const displayName = row.original.contact_type === 'Organization' 
      ? row.original.organization_name 
      : row.original.first_name || '';

    return (
      <Link to={`/contacts/${row.original.id}`}>
        <div className="text-blue-500 hover:text-inherit">{displayName}</div>
      </Link>
    );
  },
},
  {
    id: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Email' />,
    accessorFn: (row) => row['email_primary.email'],
  },
  {
    id: 'phone',
    header: 'Phone',
    accessorFn: (row) => row['phone_primary.phone'],
    cell: ({ row }) => {
      const phone = row.original['phone_primary.phone']
      if (!phone) {
        return <span className='text-gray-500'>No phone number provided</span>
      }
      return <div>{phone}</div>
    },
  },
  {
    id: 'address',
    header: 'Address',
    accessorFn: (row) =>
    [
      row['address_primary.supplemental_address_1'],
      row['address_primary.street_address'],
      row['address_primary.postal_code'],
    ].filter(Boolean).join(', '),
    cell: ({ row }) => {
      const address = []
      if (row.original['address_primary.supplemental_address_1']) {
        address.push(row.original['address_primary.supplemental_address_1'])
      }
      if (row.original['address_primary.street_address']) {
        address.push(row.original['address_primary.street_address'])
      }
      if (row.original['address_primary.postal_code']) {
        address.push(row.original['address_primary.postal_code'])
      }

      if (address.length === 0) {
        return <span className='text-gray-500'>No address provided</span>
      }
      return <div>{address.join(', ')}</div>
    },
  },
  {
    id: 'actions',
    cell: ({ row }: { row: Row<IndividualContact | OrganizationContact> }) => {
      if (row.original.contact_type === 'Individual') {
        return (
          <ActionsCell<IndividualContact>
            row={row as Row<IndividualContact>}
            type='contact'
            queryKey={['contacts']}
            EditForm={IndividualContactForm}
            updateFn={updateIndividualContact}
            deleteFn={deleteContact}
          />
        )
      } else {
        return (
          <ActionsCell<OrganizationContact>
            row={row as Row<OrganizationContact>}
            type='contact'
            queryKey={['contacts']}
            EditForm={OrganizationContactForm}
            updateFn={updateOrganizationContact}
            deleteFn={deleteContact}
          />
        )
      }
    },
  },
]
