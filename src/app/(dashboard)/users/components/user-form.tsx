"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createUser, updateUser } from "@/app/actions/user";
import { Loader2, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserFormProps {
  initialData?: any;
  organizations: any[];
  currentUserRole?: string;
}

import { useToast } from "@/components/ui/toast-context";
import { ButtonLoader } from "@/components/ui/button-loader";

export function UserForm({ initialData, organizations, currentUserRole = "PLATFORM_ADMIN" }: UserFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData;

  const defaultRoleValue = initialData?.role 
    ? initialData.role 
    : (currentUserRole === "COMPANY_ADMIN" ? "QC" : "COMPANY_ADMIN");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const role = (document.querySelector('input[name="role"]') as HTMLInputElement)?.value;
    const organizationId = (document.querySelector('input[name="organizationId"]') as HTMLInputElement)?.value;

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password") || undefined,
      role: role || defaultRoleValue,
      organizationId: organizationId || null,
      isActive: formData.get("isActive") === "on",
    };

    if (!data.role) {
      toast.error("Role is required.");
      setError("Role is required.");
      setIsSubmitting(false);
      return;
    }

    if (data.role !== "PLATFORM_ADMIN" && !data.organizationId) {
      toast.error("Company Admins and QCs must belong to an organization.");
      setError("Company Admins and QCs must belong to an organization.");
      setIsSubmitting(false);
      return;
    }

    const res = isEditing
      ? await updateUser(initialData.id, data)
      : await createUser(data);

    setIsSubmitting(false);

    if (res.success && res.data) {
      toast.success(isEditing ? "User updated successfully." : "User created successfully.");
      router.push(`/users/${res.data.id}`);
    } else {
      const errMsg = res.error || "Unable to save user.";
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
              <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
              <Input id="name" name="name" defaultValue={initialData?.name} required placeholder="e.g. John Doe" className="bg-muted/30" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
              <Input id="email" name="email" type="email" defaultValue={initialData?.email} required placeholder="john@company.com" className="bg-muted/30" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{isEditing ? "New Password (Optional)" : "Password"}</Label>
              <Input id="password" name="password" type="password" required={!isEditing} placeholder="••••••••" className="bg-muted/30" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">User Role <span className="text-red-500">*</span></Label>
              <input type="hidden" name="role" id="hidden-role" defaultValue={defaultRoleValue} />
              <Select defaultValue={defaultRoleValue} onValueChange={(v) => { (document.getElementById('hidden-role') as HTMLInputElement).value = v }} disabled={currentUserRole === "COMPANY_ADMIN"}>
                <SelectTrigger className="bg-muted/30">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {currentUserRole !== "COMPANY_ADMIN" && (
                    <SelectItem value="COMPANY_ADMIN">Company Admin</SelectItem>
                  )}
                  <SelectItem value="QC">Quality Control (QC)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="organizationId">Organization Assignment</Label>
              <input type="hidden" name="organizationId" id="hidden-org" defaultValue={initialData?.organizationId || ""} />
              <Select defaultValue={initialData?.organizationId || "NONE"} onValueChange={(v) => { (document.getElementById('hidden-org') as HTMLInputElement).value = v === "NONE" ? "" : v }}>
                <SelectTrigger className="bg-muted/30">
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None (Platform Admin Only)</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Required for Company Admin and QC roles.</p>
            </div>

            <div className="flex items-center space-x-3 md:col-span-2 bg-muted/20 p-4 rounded-lg border border-muted/50 mt-2">
              <Switch id="isActive" name="isActive" defaultChecked={initialData ? initialData.isActive : true} />
              <Label htmlFor="isActive" className="cursor-pointer">User Account is Active</Label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="button" variant="outline" className="mr-3" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <ButtonLoader 
                loading={isSubmitting} 
                label={isEditing ? "Save Changes" : "Create User"} 
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
