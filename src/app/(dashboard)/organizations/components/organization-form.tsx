"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createOrganization, updateOrganization } from "@/app/actions/organization";
import { Loader2, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface OrganizationFormProps {
  initialData?: any;
}

import { useToast } from "@/components/ui/toast-context";
import { ButtonLoader } from "@/components/ui/button-loader";

export function OrganizationForm({ initialData }: OrganizationFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      licenseNumber: formData.get("licenseNumber"),
      contactEmail: formData.get("contactEmail"),
      contactPhone: formData.get("contactPhone"),
      address: formData.get("address"),
      isActive: formData.get("isActive") === "on",
    };

    const res = isEditing 
      ? await updateOrganization(initialData.id, data)
      : await createOrganization(data);

    setIsSubmitting(false);

    if (res.success && res.data) {
      toast.success(isEditing ? "Organization updated successfully." : "Organization created successfully.");
      router.push(`/organizations/${res.data.id}`);
    } else {
      const errMsg = res.error || "Unable to save organization.";
      toast.error(errMsg);
      setError(errMsg);
    }
  }

  return (
    <Card className="shadow-sm border-muted/60 overflow-hidden rounded-xl">
      <CardContent className="p-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name <span className="text-red-500">*</span></Label>
              <Input id="name" name="name" defaultValue={initialData?.name} required placeholder="e.g. Biofix Aqua" className="bg-muted/30" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="licenseNumber">BIS License Number</Label>
              <Input id="licenseNumber" name="licenseNumber" defaultValue={initialData?.licenseNumber} placeholder="e.g. BIS-12345" className="bg-muted/30" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input id="contactEmail" name="contactEmail" type="email" defaultValue={initialData?.contactEmail} placeholder="contact@company.com" className="bg-muted/30" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input id="contactPhone" name="contactPhone" defaultValue={initialData?.contactPhone} placeholder="+1 234 567 890" className="bg-muted/30" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Registered Address</Label>
              <Input id="address" name="address" defaultValue={initialData?.address} placeholder="Full address" className="bg-muted/30" />
            </div>

            <div className="flex items-center space-x-3 md:col-span-2 bg-muted/20 p-4 rounded-lg border border-muted/50 mt-2">
              <Switch id="isActive" name="isActive" defaultChecked={initialData ? initialData.isActive : true} />
              <Label htmlFor="isActive" className="cursor-pointer">Organization is Active</Label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="button" variant="outline" className="mr-3" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <ButtonLoader 
                loading={isSubmitting} 
                label={isEditing ? "Save Changes" : "Create Organization"} 
                loadingLabel={isEditing ? "Saving..." : "Creating..."} 
                icon={<Save className="h-4 w-4" />}
              />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
