"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createCertificate, updateCertificate } from "@/app/actions/certificate";
import { Loader2, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CertificateFormProps {
  initialData?: any;
  organizations: any[];
  currentUserId: string;
}

export function CertificateForm({ initialData, organizations, currentUserId }: CertificateFormProps) {
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
    const status = (document.getElementById('hidden-status') as HTMLInputElement)?.value;

    const data = {
      certificateNumber: formData.get("certificateNumber"),
      issueDate: formData.get("issueDate"),
      standard: formData.get("standard"),
      organizationId: organizationId,
      batchNumber: formData.get("batchNumber"),
      status: status || "DRAFT",
    };

    if (!data.organizationId || !data.batchNumber) {
      setError("Organization and Batch Number are required.");
      setIsSubmitting(false);
      return;
    }

    const res = isEditing 
      ? await updateCertificate(initialData.id, data, currentUserId)
      : await createCertificate(data, currentUserId);

    setIsSubmitting(false);

    if (res.success && res.data) {
      router.push(`/certificates/${res.data.id}`);
    } else {
      setError(res.error || "An unknown error occurred.");
    }
  }

  const defaultDate = initialData?.issueDate 
    ? new Date(initialData.issueDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

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
              <Label htmlFor="certificateNumber">Certificate Number</Label>
              <Input id="certificateNumber" name="certificateNumber" defaultValue={initialData?.certificateNumber} placeholder="Leave empty to auto-generate" className="bg-muted/30" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date <span className="text-red-500">*</span></Label>
              <Input id="issueDate" name="issueDate" type="date" defaultValue={defaultDate} required className="bg-muted/30" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="standard">Compliance Standard <span className="text-red-500">*</span></Label>
              <Input id="standard" name="standard" defaultValue={initialData?.standard || "BIS IS 14543"} required className="bg-muted/30" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchNumber">Production Batch Number <span className="text-red-500">*</span></Label>
              <Input id="batchNumber" name="batchNumber" defaultValue={initialData?.batchNumber} required placeholder="e.g. EB26175" className="bg-muted/30" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationId">Organization <span className="text-red-500">*</span></Label>
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

            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="status">Certificate Status <span className="text-red-500">*</span></Label>
                <input type="hidden" name="status" id="hidden-status" defaultValue={initialData?.status || "DRAFT"} />
                <Select defaultValue={initialData?.status || "DRAFT"} onValueChange={(v) => { (document.getElementById('hidden-status') as HTMLInputElement).value = v }}>
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ISSUED">Issued</SelectItem>
                    <SelectItem value="REVOKED">Revoked</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="button" variant="outline" className="mr-3" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEditing ? "Save Changes" : "Issue Certificate"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
