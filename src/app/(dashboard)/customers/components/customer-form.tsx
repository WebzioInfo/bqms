"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createCustomer, updateCustomer } from "@/app/actions/customer";
import { Loader2, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CustomerFormProps {
  initialData?: any;
  organizations: any[];
  currentUserId: string;
}

export function CustomerForm({ initialData, organizations, currentUserId }: CustomerFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const organizationId = (document.getElementById('hidden-org') as HTMLInputElement)?.value;
    const type = (document.getElementById('hidden-type') as HTMLInputElement)?.value;

    const data = {
      name: formData.get("name"),
      type: type || "DISTRIBUTOR",
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      organizationId: organizationId,
      isActive: formData.get("isActive") === "on",
    };

    if (!data.organizationId) {
      setError("Organization is required.");
      setIsSubmitting(false);
      return;
    }

    const res = isEditing 
      ? await updateCustomer(initialData.id, data, currentUserId)
      : await createCustomer(data, currentUserId);

    setIsSubmitting(false);

    if (res.success && res.data) {
      router.push(`/customers/${res.data.id}`);
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
              <Label htmlFor="name">Customer Name <span className="text-red-500">*</span></Label>
              <Input id="name" name="name" defaultValue={initialData?.name} required placeholder="Acme Logistics Ltd" className="bg-muted/30" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Customer Type <span className="text-red-500">*</span></Label>
              <input type="hidden" name="type" id="hidden-type" defaultValue={initialData?.type || "DISTRIBUTOR"} />
              <Select defaultValue={initialData?.type || "DISTRIBUTOR"} onValueChange={(v) => { (document.getElementById('hidden-type') as HTMLInputElement).value = v }}>
                <SelectTrigger className="bg-muted/30">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DISTRIBUTOR">Distributor</SelectItem>
                  <SelectItem value="RETAILER">Retailer</SelectItem>
                  <SelectItem value="DIRECT_CONSUMER">Direct Consumer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" defaultValue={initialData?.email || ""} placeholder="contact@acme.com" className="bg-muted/30" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" defaultValue={initialData?.phone || ""} placeholder="+1 (555) 123-4567" className="bg-muted/30" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Billing / Shipping Address</Label>
              <Textarea id="address" name="address" defaultValue={initialData?.address || ""} placeholder="123 Commerce St, Warehouse 4..." className="bg-muted/30 min-h-[80px]" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationId">Managing Organization <span className="text-red-500">*</span></Label>
              <input type="hidden" name="organizationId" id="hidden-org" defaultValue={initialData?.organizationId || ""} />
              <Select defaultValue={initialData?.organizationId || ""} onValueChange={(v) => { (document.getElementById('hidden-org') as HTMLInputElement).value = v }}>
                <SelectTrigger className="bg-muted/30">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-3 bg-muted/20 p-4 rounded-lg border border-muted/50 mt-6">
              <Switch id="isActive" name="isActive" defaultChecked={initialData ? initialData.isActive : true} />
              <Label htmlFor="isActive" className="cursor-pointer">Account Active</Label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="button" variant="outline" className="mr-3" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEditing ? "Save Changes" : "Add Customer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
