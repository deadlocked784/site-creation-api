"use client"

import * as React from "react"
import { ChevronDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useQuery } from "@tanstack/react-query"
import { getContacts, getContact } from "@/services/contacts"
import { useDebounce } from "@/lib/useDebounce"
import AddContactDialog from "@/pages/Contacts/ContactListPage/components/add-contact-dialog"

async function fetchContactSafe(id: string) {
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return null;
  }
  try {
    return await getContact(numericId);
  } catch {
    return null;
  }
}

interface ContactComboboxProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  defaultValue?: string;
  items?: Array<{
    id: number;
    display_name: string;
    "email_primary.email"?: string;
    external_identifier?: string;
  }>;
}

function CreateContact({ setOpen, onContactCreate }: { setOpen: (open: boolean) => void, onContactCreate?: () => void }) {
  return <>
    {/* Create Contact Option */}
    < CommandGroup heading="Actions" >
      <CommandItem
        onSelect={() => {
          setOpen(false);
          onContactCreate?.();
        }}
        className="text-blue-600 font-medium">

        <Plus /> Create new contact

      </CommandItem>
    </CommandGroup >
  </>
}

/**
 * Combobox allows users to perform an entity search to generate a list of selectable items.
 */
export function ContactCombobox(props: ContactComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [isAddContactOpen, setIsAddContactOpen] = React.useState(false);
  const [contactTab, setContactTab] = React.useState<'Individual' | 'Organization'>('Individual');

  const debouncedValue = useDebounce(search, 300);     // only updates after 300 ms

  // Fetch contacts data for combobox options
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["contacts", debouncedValue],
    queryFn: () => getContacts({ searchString: debouncedValue.trim() }),
    enabled: debouncedValue.trim().length > 0,
  })

  const { data: initialContact } = useQuery({
    queryKey: ["contacts", "byId", props.value],
    queryFn: () => fetchContactSafe(props.value!),
    enabled: typeof props.value === "string" && props.value.trim() !== "",
    retry: false
  });

  const data = React.useMemo(() => {
    if (props.items && props.items.length) return props.items

    if (debouncedValue.trim().length > 0) return searchResults;
    return initialContact ? [initialContact] : [];
  }, [props.items, searchResults, initialContact, debouncedValue]);

  // Resolve display name for the current value
  const selectedContact = data.find((c) => String(c.id) === props.value);

  // whenever we clear the input, drop the selection
  React.useEffect(() => {
    if (search.trim() === "") {
      props.onChange(undefined);
    }
  }, [search, props]);

  // Clear selected contact if search is cleared and selected ID is no longer in results
  React.useEffect(() => {
    if (search.trim() === "") {
      const found = searchResults.find((c) => String(c.id) === props.value);
      if (!found && props.value) {
        props.onChange(undefined);
      }
    }
  }, [search, searchResults, props.onChange]);

  return (
    <div className="relative w-full flex items-center gap-2">
      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          // when opening, seed the input with the existing name
          if (isOpen && selectedContact) {
            setSearch(selectedContact.display_name || "");
          }
        }}
        modal
        >
        <PopoverTrigger asChild className={`${selectedContact ? 'text-black' : 'text-gray-500'}`}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedContact
              ? `${selectedContact.display_name}${selectedContact["email_primary.email"] ? ` (${selectedContact["email_primary.email"]})` : ""}`
              : "Select Contact"}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0">
          <Command filter={() => 1}>
            <CommandInput
              placeholder="Search by Name, Email, ID, NRIC/FIN/UEN..."
              value={search}
              onValueChange={setSearch}
              autoFocus
            />
            <CommandList className="max-h-64 overflow-y-auto">
              {/* Create Contact Option */}
              <CreateContact
                setOpen={setOpen}
                onContactCreate={() => {
                  setOpen(false);
                  setIsAddContactOpen(true);
                }}
              />

              {/* Empty message - must always be present */}
              <CommandEmpty >
                {isLoading
                  ? "Searching…"
                  : debouncedValue.trim() === ""
                    ? "Type to search"
                    : "No Contacts found."}
              </CommandEmpty>

              {/* Search Results */}
              <CommandGroup heading="Contacts">
                {
                  data.length === 0 && (
                    isLoading
                      ?
                      <CommandItem disabled className="text-gray-500">
                        Searching...
                      </CommandItem>
                      :
                      debouncedValue.trim() === ""
                        ?
                        <CommandItem disabled className="text-gray-500">
                          Type to search.
                        </CommandItem>
                        :
                        <CommandItem disabled className="text-gray-500">
                          No contacts found.
                        </CommandItem>
                  )
                }
                {
                  data.map((contact) => (
                    <CommandItem
                      key={contact.id}
                      value={contact.id.toString()}
                      onSelect={() => {
                        props.onChange(String(contact.id));
                        setOpen(false);
                      }}
                      className={cn("flex items-center justify-between px-2 py-1",)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {contact.display_name}
                        </span>
                        {contact["email_primary.email"] && (
                          <span className="text-xs text-gray-500">
                            {contact["email_primary.email"]}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          ID: {contact.id}
                        </span>
                        <span className="text-xs text-gray-500">
                          NRIC/FIN/UEN: {contact.external_identifier || "-"}
                        </span>
                      </div>
                    </CommandItem>
                  ))
                }
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <AddContactDialog
        currentTab={contactTab}
        onCurrentTabChange={(tab: string) => setContactTab(tab === "Organization" ? "Organization" : "Individual")}
        open={isAddContactOpen}
        onOpenChange={setIsAddContactOpen} canAddOrganizations={false} canAddIndividuals={false}      />
    </div>
  )
}