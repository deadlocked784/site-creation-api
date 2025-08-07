"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { contactListColumns } from "./components/columns/contact-list-columns";
import AddContactDialog from "./components/add-contact-dialog";
import DataTable from "@/components/table/data-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getContactsByGroup } from "@/services/groups";
import { getContacts } from "@/services/contacts";
import { contactFilters } from "@/components/table/data-table-filter-field";
import { useDataTableFilters } from "@/hooks/use-table-data-filters";
import type { IndividualContact, OrganizationContact } from "@/types/contact";
import { useGroups } from "@/hooks/use-groups";

export default function ContactListPage() {
  const { data: groupsData, isLoading: groupsLoading } = useGroups();
  const groups = groupsData || [];

  const canAddOrganizations = useMemo(() => {
    return groups.some((g) =>
      g.title.toLowerCase().includes("organization")
    );
  }, [groups]);

  const canAddIndividuals = useMemo(() => {
    return groups.some((g) =>
      g.title.toLowerCase().includes("individual")
    );
  }, [groups]);

  const availableTabs = useMemo(() => {
    const tabs = [];
    if (canAddIndividuals) tabs.push({ value: "Individual", label: "Individual" });
    if (canAddOrganizations) tabs.push({ value: "Organization", label: "Organization" });
    if (groups.length > 0) tabs.push({ value: "Groups", label: "Groups" });
    return tabs;
  }, [groups, canAddIndividuals, canAddOrganizations]);

  const [currentTab, setCurrentTab] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<{ id: number; title: string } | null>(null);
  const [groupContacts, setGroupContacts] = useState<(IndividualContact | OrganizationContact)[]>([]);
  const [loadingGroupContacts, setLoadingGroupContacts] = useState(false);
  const [groupContactsError, setGroupContactsError] = useState<string | null>(null);

  const previewMap = [
    { label: "Name", key: "name" }, // ✅ unified virtual field
    { label: "Email", key: "email_primary.email" },
    { label: "Phone", key: "phone_primary.phone" },
    { label: "Address", key: "address_primary.street_address" },
  ];

  useEffect(() => {
    if (availableTabs.length && !currentTab) {
      setCurrentTab(availableTabs[0].value);
    }
  }, [availableTabs, currentTab]);

  const contactsQuery = useQuery({
    queryKey: ["contacts", { contactType: currentTab }],
    queryFn: () => getContacts({ contactType: currentTab }),
    enabled: !!currentTab && currentTab !== "Groups",
  });

  const groupsQuery = useQuery({
    queryKey: ["groups"],
    queryFn: () => Promise.resolve(groups || []),
    enabled: currentTab === "Groups" && selectedGroup === null,
  });

  const { setFilters, filterFields, filteredData } = useDataTableFilters(
    contactFilters,
    contactsQuery.data || []
  );

  // ✅ Normalize filteredData to include a virtual 'name' field
  const normalizedFilteredData = useMemo(() => {
    return filteredData.map((contact) => ({
      ...contact,
      name:
        contact.contact_type === "Organization"
          ? contact.organization_name
          : contact.first_name,
    }));
  }, [filteredData]);

  const fetchContactsByGroup = async (groupId: number) => {
    setLoadingGroupContacts(true);
    setGroupContactsError(null);
    try {
      const contacts = await getContactsByGroup(groupId);
      setGroupContacts(contacts);
    } catch {
      setGroupContactsError("Failed to load group contacts");
    } finally {
      setLoadingGroupContacts(false);
    }
  };

  const showAddButton =
    (currentTab === "Individual" && canAddIndividuals) ||
    (currentTab === "Organization" && canAddOrganizations);

  if (groupsLoading) return <div>Loading groups...</div>;
  if (availableTabs.length === 0) return <div>No access granted</div>;
  if (contactsQuery.error) return <div>Error loading contacts</div>;
  if (groupsQuery.error) return <div>Error loading groups</div>;

  const groupsColumns = [
    { accessorKey: "id", header: "Group ID" },
    {
      accessorKey: "title",
      header: "Group Name",
      cell: ({ row }: { row: { original: { id: number; title: string } } }) => (
        <button
          className="text-blue-600 hover:underline"
          onClick={() => {
            setSelectedGroup({ id: row.original.id, title: row.original.title });
            fetchContactsByGroup(row.original.id);
          }}
        >
          {row.original.title}
        </button>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList>
            {availableTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {showAddButton && (
          <AddContactDialog
            currentTab={currentTab}
            onCurrentTabChange={setCurrentTab}
            open={open}
            onOpenChange={setOpen}
            canAddOrganizations={canAddOrganizations}
            canAddIndividuals={canAddIndividuals}
          />
        )}
      </div>

      {currentTab === "Groups" ? (
        selectedGroup ? (
          <div className="space-y-4">
            <button
              className="px-3 py-1 bg-gray-100 rounded-lg"
              onClick={() => setSelectedGroup(null)}
            >
              ← Back to Groups
            </button>
            {loadingGroupContacts && <div>Loading group contacts...</div>}
            {groupContactsError && <div className="text-red-500">{groupContactsError}</div>}
            <DataTable
              columns={contactListColumns}
              data={groupContacts}
              isLoading={loadingGroupContacts}
            />
          </div>
        ) : (
          <DataTable
            columns={groupsColumns}
            data={(groupsQuery.data || []).map((group) => ({
              id: group.id,
              title: group.title ?? group.name ?? "",
            }))}
            isLoading={groupsQuery.isLoading}
          />
        )
      ) : (
        <DataTable
          columns={contactListColumns}
          data={normalizedFilteredData} // ✅ use normalized version with 'name' key
          isLoading={contactsQuery.isLoading}
          filterFields={filterFields}
          onFilterChange={setFilters}
          previewMap={previewMap}
          basePath="contacts"
        />
      )}
    </div>
  );
}
