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
}

export function UserForm({ initialData, organizations }: UserFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    // We get role and organizationId manually because they are from Select components
    // Actually, Select inside a form doesn't pass standard form data unless configured to.
    // Let's rely on standard html hidden inputs or simple state if needed. 
    // In shadcn, we usually use react-hook-form. For this simple form, we'll grab values directly.

    const role = (document.querySelector('input[name="role"]') as HTMLInputElement)?.value;
    const organizationId = (document.querySelector('input[name="organizationId"]') as HTMLInputElement)?.value;

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password") || undefined,
      role: role,
      organizationId: organizationId || null,
      isActive: formData.get("isActive") === "on",
    };

    if (!data.role) {
      setError("Role is required.");
      setIsSubmitting(false);
      return;
    }

    if (data.role !== "PLATFORM_ADMIN" && !data.organizationId) {
      setError("Company Admins and QCs must belong to an organization.");
      setIsSubmitting(false);
      return;
    }

    const res = isEditing 
      ? await updateUser(initialData.id, data)
      : await createUser(data);

    setIsSubmitting(false);

    if (res.success && res.data) {
      router.push(`/users/${res.data.id}`);
    } else {
      setError(res.error || "An unknown error occurred.");
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
              <input type="hidden" name="role" id="hidden-role" defaultValue={initialData?.role || "COMPANY_ADMIN"} />
              <Select defaultValue={initialData?.role || "COMPANY_ADMIN"} onValueChange={(v) => { (document.getElementById('hidden-role') as HTMLInputElement).value = v }}>
                <SelectTrigger className="bg-muted/30">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLATFORM_ADMIN">Platform Admin</SelectItem>
                  <SelectItem value="COMPANY_ADMIN">Company Admin</SelectItem>
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
            <Button type="button" variant="outline" className="mr-3" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEditing ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
