import type { FilterField } from "@/types/filter";
import { getFinancialTypes } from "@/services/financial-types";
import { getParentsAndSubtypes } from "@/services/contact-types";
import { getOptionValues } from "@/services/option-values";
import { getCustomGroups } from "@/services/custom-groups";
import { getGroups } from "@/services/groups";
import {getOptionValuesMap, getCustomFieldsForGroups, buildCustomFieldFilters, } from "./filter-utils";

const baseContributionFilters: FilterField[] = [
  { type: "text", id: "contact.display_name", label: "Display Name" },
  { type: "dateRange", id: "receive_date", label: "Contribution Date" },
  { type: "select", id: "financial_type_id", label: "Financial Type", options: [] },
  { type: "numberRange", id: "total_amount", label: "Total Amount" },
  { type: "select", id: "contact_id.contact_type", label: "Contact Type", options: [] },
  { type: "select", id: "payment_instrument_id", label: "Payment Method", options: [] },
  { type: "select", id: "contribution_status_id", label: "Contribution Status", options: [] },
];

const baseContactFilters: FilterField[] = [
  { type: "text", id: "display_name", label: "Display Name" },
  { type: "text", id: "address_primary.street_address", label: "Address" },
  { type: "text", id: "address_primary.postal_code", label: "Postal Code" },
  { type: "select", id: "group_contact.group_id:label", label: "Group" },
];

const baseActivityFilters: FilterField[] = [
  { type: "select", id: "activity_type_id", label: "Type" },
  { type: "text", id: "subject", label: "Subject" },
  { type: "text", id: "source.display_name", label: "Added By" },
  { type: "text", id: "target.display_name", label: "With" },
  { type: "text", id: "assignee.display_name", label: "Assigned" },
  { type: "dateRange", id: "activity_date_time", label: "Date" },
  { type: "select", id: "status_id", label: "Status" },
];

export const irasTransactionFilters = async (): Promise<FilterField[]> => {
  return [
    {
      type: "select",
      id: "sent_method",
      label: "Sent Method",
      options: [
        // { label: "All", value: null },
        { label: "New transactions", value: "New transactions" },
        { label: "Offline", value: "Offline" },
        { label: "API", value: "API" },
      ],
    },
    {
      type: "select",
      id: "sent_response",
      label: "Sent Response",
      options: [
        // { label: "All", value: null },
        { label: "Success", value: "Success" },
        { label: "Fail", value: "Fail" },
      ],
    },
  ];
};


export async function contributionFilters(): Promise<FilterField[]> {
  const [
    financialTypes,
    contactTypesResponse,
    paymentMethodResponse,
    contributionStatusResponse,
    allCustomGroups,
  ] = await Promise.all([
    getFinancialTypes(),
    getParentsAndSubtypes(),
    getOptionValues({ optionGroupId: 10 }),
    getOptionValues({ optionGroupId: 11 }),
    getCustomGroups(),
  ]);

  const customGroups = allCustomGroups.filter(group => group.extends === "Contribution");

  const contactTypeOptions = [
    ...contactTypesResponse.parents.map(p => ({ label: p.name, value: p.name })),
    ...contactTypesResponse.subtypes.map(st => ({ label: st.name, value: st.name })),
  ];

  const financialTypeOptions = financialTypes.map(t => ({
    label: t.label,
    value: t.id,
  }));

  const paymentMethodTypeOptions = paymentMethodResponse.map(t => ({
    label: t.label ?? t.name ?? String(t),
    value: t.value,
  }));

  const contributionStatusTypeOptions = contributionStatusResponse.map(t => ({
    label: t.label ?? t.name ?? String(t),
    value: t.value,
  }));

  const filtersWithOptions = baseContributionFilters.map(filter => {
    if (filter.id === "financial_type_id") return { ...filter, options: financialTypeOptions };
    if (filter.id === "contact_id.contact_type") return { ...filter, options: contactTypeOptions };
    if (filter.id === "payment_instrument_id") return { ...filter, options: paymentMethodTypeOptions };
    if (filter.id === "contribution_status_id") return { ...filter, options: contributionStatusTypeOptions };
    return filter;
  });

  const allCustomFields = await getCustomFieldsForGroups(customGroups);
  const optionGroupIds = allCustomFields.map(({ field }) => field.option_group_id);
  const optionValuesMap = await getOptionValuesMap(optionGroupIds);
  const customFieldFilters = buildCustomFieldFilters(allCustomFields, optionValuesMap);

  return [...filtersWithOptions, ...customFieldFilters];
}

export async function contactFilters(): Promise<FilterField[]> {
  const [contactTypesResponse, allCustomGroups, groupResponse] = await Promise.all([
    getParentsAndSubtypes(),
    getCustomGroups(),
    getGroups(),
  ]);

  const customGroups = allCustomGroups.filter(group => group.extends === "Contact");

  const contactTypeOptions = contactTypesResponse.subtypes.map(st => ({
    label: st.name,
    value: st.id,
  }));

  const groupOptions = groupResponse.map(t => ({
    label: t.title ?? t.name ?? String(t.id),
    value: t.id,
  }));

  const filtersWithOptions = baseContactFilters.map(filter => {
    if (filter.id === "contact_type") return { ...filter, options: contactTypeOptions };
    if (filter.id === "group_contact.group_id:label") return { ...filter, options: groupOptions };
    return filter;
  });

  const allCustomFields = await getCustomFieldsForGroups(customGroups);
  const optionGroupIds = allCustomFields.map(({ field }) => field.option_group_id);
  const optionValuesMap = await getOptionValuesMap(optionGroupIds);
  const customFieldFilters = buildCustomFieldFilters(allCustomFields, optionValuesMap);

  return [...filtersWithOptions, ...customFieldFilters];
}

export async function activityFilters(): Promise<FilterField[]> {
  const [allCustomGroups, groupResponse, allActivityType, allActivityStatus] = await Promise.all([
    getCustomGroups(),
    getGroups(),
    getOptionValues({ optionGroupName: 'activity_type' }),
    getOptionValues({ optionGroupName: "activity_status" }),
  ]);

  const activityTypesOptions = allActivityType.map(t => ({
    label: t.label,
    value: t.value,
  }));
  
    const activityStatusOptions = allActivityStatus.map(t => ({
    label: t.label,
    value: t.value,
  }));

  const customGroups = allCustomGroups.filter(group => group.extends === "Activity");

  const groupOptions = groupResponse.map(t => ({
    label: t.title ?? t.name ?? String(t.id),
    value: t.id,
  }));

  const filtersWithOptions = baseActivityFilters.map(filter => {
    if (filter.id === "activity_type_id") return { ...filter, options: activityTypesOptions };
    if (filter.id === "status_id") return { ...filter, options: activityStatusOptions };
    if (filter.id === "group_contact.group_id:label") return { ...filter, options: groupOptions };
    return filter;
  });
  
  const allCustomFields = await getCustomFieldsForGroups(customGroups);
  const optionGroupIds = allCustomFields.map(({ field }) => field.option_group_id);
  const optionValuesMap = await getOptionValuesMap(optionGroupIds);
  const customFieldFilters = buildCustomFieldFilters(allCustomFields, optionValuesMap);

  return [...filtersWithOptions, ...customFieldFilters];
}
