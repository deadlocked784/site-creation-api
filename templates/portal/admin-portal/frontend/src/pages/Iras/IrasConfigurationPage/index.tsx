import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getConfigurations } from "@/services/iras";
import { updateConfigurations } from "@/services/iras";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConfigurationPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["configurations"],
    queryFn: getConfigurations,
  });

  const [validateOnly, setValidateOnly] = useState(false);

  const [formData, setFormData] = useState({
    organization_name: "",
    authorized_user_nric: "",
    authorized_user_full_name: "",
    authorized_user_designation: "",
    phone_number: "",
    email: "",
    receipt_prefix: "",
    minimum_amount: "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        organization_name: data.organisation_name || "",
        authorized_user_nric: data.authorised_person_id?.toString() || "",
        authorized_user_full_name: data.authorised_person_name || "",
        authorized_user_designation: data.authorised_person_designation || "",
        phone_number: data.authorised_person_phone || "",
        email: data.authorised_person_email || "",
        receipt_prefix: data.prefix || "",
        minimum_amount: data.min_amount?.toString() || "",
      });

      setValidateOnly(data.validate_only ?? false);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.organization_name || !formData.email || !formData.minimum_amount) {
      toast.error("Organization Name, Email, and Minimum Amount are required.");
      return;
    }

    try {
      await updateConfigurations({
        validate_only: validateOnly,
        organisation_name: formData.organization_name,
        authorised_person_id: parseInt(formData.authorized_user_nric, 10),
        authorised_person_name: formData.authorized_user_full_name,
        authorised_person_designation: formData.authorized_user_designation,
        authorised_person_phone: formData.phone_number,
        authorised_person_email: formData.email,
        prefix: formData.receipt_prefix,
        min_amount: parseFloat(formData.minimum_amount),
      });

      toast.success("Settings saved");
      console.log("Submitting config update:", {
        validate_only: validateOnly,
        organisation_name: formData.organization_name,
        authorised_person_id: parseInt(formData.authorized_user_nric, 10),
        authorised_person_name: formData.authorized_user_full_name,
        authorised_person_designation: formData.authorized_user_designation,
        authorised_person_phone: formData.phone_number,
        authorised_person_email: formData.email,
        prefix: formData.receipt_prefix,
        min_amount: parseFloat(formData.minimum_amount),
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Organization Settings</h1>

      <div className="flex items-center space-x-3 mb-6">
        {isLoading ? (
          <>
            <Skeleton className="h-5 w-10 rounded-sm" />
            <Skeleton className="h-5 w-32" />
          </>
        ) : (
          <>
            <Switch
              id="validateOnly"
              checked={validateOnly}
              onCheckedChange={setValidateOnly}
            />
            <Label htmlFor="validateOnly">Validate Only</Label>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))
        ) : (
          <>
            <div>
              <Label htmlFor="organization_name">Organization Name</Label>
              <Input
                id="organization_name"
                name="organization_name"
                value={formData.organization_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="authorized_user_nric">Authorized User NRIC</Label>
              <Input
                id="authorized_user_nric"
                name="authorized_user_nric"
                value={formData.authorized_user_nric}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="authorized_user_full_name">Authorized User Full Name</Label>
              <Input
                id="authorized_user_full_name"
                name="authorized_user_full_name"
                value={formData.authorized_user_full_name}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="authorized_user_designation">Authorized User Designation</Label>
              <Input
                id="authorized_user_designation"
                name="authorized_user_designation"
                value={formData.authorized_user_designation}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="phone_number">Authorized User Phone Number</Label>
              <Input
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="email">Authorized User Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="receipt_prefix">Receipt No. Prefix</Label>
              <Input
                id="receipt_prefix"
                name="receipt_prefix"
                value={formData.receipt_prefix}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="minimum_amount">Minimum Amount</Label>
              <Input
                id="minimum_amount"
                name="minimum_amount"
                type="number"
                value={formData.minimum_amount}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        <div className="col-span-full mt-4">
          {isLoading ? (
            <Skeleton className="h-10 w-32" />
          ) : (
            <Button type="submit">Save Settings</Button>
          )}
        </div>
      </form>
    </div>
  );
}
