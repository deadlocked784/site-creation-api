export interface Contact {
    id: number;
    display_name?: string;
    'email_primary.email'?: string;
    'phone_primary.phone'?: string;
    external_identifier?: string;
    'address_primary.postal_code'?: string;
    'address_primary.supplemental_address_1'?: string;
    'address_primary.street_address'?: string;
}

export interface IndividualContact extends Contact {
    contact_type: 'Individual';
    first_name: string;
    last_name: string;
    birth_date?: Date;
    [key: `Additional_Donor_Particulars.${string}`]: unknown;
}

export interface OrganizationContact extends Contact {
    contact_type: 'Organization';
    organization_name: string;
}
