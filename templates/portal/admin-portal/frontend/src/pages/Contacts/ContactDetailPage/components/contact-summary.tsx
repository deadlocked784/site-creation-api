import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { IndividualContact, OrganizationContact } from "@/types/contact";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  Pencil,
  EllipsisVertical,
} from "lucide-react";
import EditDialog from "@/components/dialogs/edit-dialog";
import IndividualContactForm from "../../components/forms/individual-contact-form";
import { getContact, updateContact } from "@/services/contacts";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import ContactSummarySkeleton from "./contact-summary-skeleton";

export default function ContactSummary() {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);

  const [contact, setContact] = useState<IndividualContact | OrganizationContact | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!numericId || isNaN(numericId)) {
      toast.error("Invalid contact ID.");
      return;
    }

    const fetchContact = async () => {
      try {
        const data = await getContact(numericId);
        setContact(data);
      } catch (error) {
        toast.error("Failed to fetch contact.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [numericId]);

  const handleSave = async (updatedContact: Omit<IndividualContact, "id">) => {
    if (!contact) return;

    try {
      await updateContact(contact.id, updatedContact);
      const refreshedContact = await getContact(contact.id);
      setContact(refreshedContact);
      toast.success("Contact updated successfully.");
      setOpenEdit(false);
    } catch (error) {
      toast.error("Failed to update contact.");
      console.error(error);
    }
  };

  if (loading) return <ContactSummarySkeleton />;

  if (!contact) return null;

  const isIndividual = contact.contact_type === "Individual";

  return (
    <>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="bg-gray-200 rounded-full p-4">
              <UserRound className="size-16" />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <CardTitle className="text-xl">
                  {contact.contact_type === "Organization"
                    ? contact.organization_name
                    : contact.first_name}
                </CardTitle>
              </div>
              <CardDescription className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <Mail className="size-4" />
                  <span>{contact["email_primary.email"]}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <Phone className="size-4" />
                  <span>{contact["phone_primary.phone"]}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <MapPin className="size-4" />
                  <span>
                    {contact["address_primary.street_address"]},{" "}
                    {contact["address_primary.postal_code"]}
                  </span>
                </div>
              </CardDescription>
            </div>
          </div>
          <CardAction className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpenEdit(true)}>
              <Pencil />
              <span className="hidden lg:inline">Edit</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                  size="icon"
                >
                  <EllipsisVertical />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
      </Card>

      {isIndividual && (
        <EditDialog
          open={openEdit}
          onOpenChange={setOpenEdit}
          type="individual"
          Form={
            <IndividualContactForm
              initialData={contact as IndividualContact}
              isPending={false}
              onSave={handleSave}
            />
          }
        />
      )}
    </>
  );
}
