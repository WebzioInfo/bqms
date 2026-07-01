"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createCertificate, updateCertificate } from "@/app/actions/certificate";
import { Loader2, Save } from "lucide-react";

interface CertificateFormProps {
  initialData?: any;
  organizations: any[];
  reports: any[];
  currentUserId: string;
}

import { useToast } from "@/components/ui/toast-context";
import { ButtonLoader } from "@/components/ui/button-loader";

export function CertificateForm({ initialData, organizations, reports, currentUserId }: CertificateFormProps) {
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
    
    const organizationId = (document.getElementById('hidden-org') as HTMLInputElement)?.value;
    const reportId = (document.getElementById('hidden-report') as HTMLInputElement)?.value;
    const status = (document.getElementById('hidden-status') as HTMLInputElement)?.value;

    const data = {
      certificateNumber: formData.get("certificateNumber"),
      issueDate: formData.get("issueDate"),
      standard: formData.get("standard"),
      certificateImage: formData.get("certificateImage"),
      organizationId: organizationId,
      reportId: reportId,
      status: status || "ISSUED",
    };

    // Frontend validation removed as per user request to hide these fields
    if (!data.organizationId && reports.length > 0) {
      data.organizationId = reports[0].organizationId;
    }
    if (!data.reportId && reports.length > 0) {
      data.reportId = reports[0].id;
    }

    const res = isEditing 
      ? await updateCertificate(initialData.id, data, currentUserId)
      : await createCertificate(data, currentUserId);

    setIsSubmitting(false);

    if (res.success && res.data) {
      toast.success(isEditing ? "Certificate updated successfully." : "Certificate issued successfully.");
      router.push(`/certificates/${res.data.id}`);
    } else {
      const errMsg = res.error || "Unable to save certificate.";
      toast.error(errMsg);
      setError(errMsg);
    }
  }

  const defaultDate = initialData?.issueDate 
    ? new Date(initialData.issueDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  // Resolve organization and report references automatically
  const defaultReport = reports.find(r => r.id === initialData?.reportId) || reports[0];
  const reportId = initialData?.reportId || defaultReport?.id || "";
  const organizationId = initialData?.organizationId || defaultReport?.organizationId || "";
  const status = initialData?.status || "ISSUED";

  return (
    <Card className="shadow-sm border-muted/60 overflow-hidden rounded-xl">
      <CardContent className="p-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}
        
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Hidden inputs placed outside commented-out blocks so they exist in the DOM */}
          <input type="hidden" name="organizationId" id="hidden-org" defaultValue={organizationId} />
          <input type="hidden" name="reportId" id="hidden-report" defaultValue={reportId} />
          <input type="hidden" name="status" id="hidden-status" defaultValue={status} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="standard">Certificate Name <span className="text-red-500">*</span></Label>
              <Input id="standard" name="standard" defaultValue={initialData?.standard || "BIS IS 14543"} required className="bg-muted/30" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificateNumber">Certificate Number</Label>
              <Input id="certificateNumber" name="certificateNumber" defaultValue={initialData?.certificateNumber} placeholder="Leave empty to auto-generate" className="bg-muted/30" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date <span className="text-red-500">*</span></Label>
              <Input id="issueDate" name="issueDate" type="date" defaultValue={defaultDate} required className="bg-muted/30" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="certificateImage">Certificate Image URL</Label>
              <Input id="certificateImage" name="certificateImage" type="url" defaultValue={initialData?.certificateImage || ""} placeholder="https://example.com/image.jpg" className="bg-muted/30" />
            </div>
          </div>

          {initialData?.certificateImage && (
            <div className="mt-4 border rounded-lg p-4 bg-muted/10">
              <Label className="mb-2 block">Current Image</Label>
              <img src={initialData.certificateImage} alt="Certificate" className="max-h-64 object-contain rounded-md" />
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button type="button" variant="outline" className="mr-3" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <ButtonLoader 
                loading={isSubmitting} 
                label={isEditing ? "Save Changes" : "Issue Certificate"} 
                loadingLabel={isEditing ? "Saving..." : "Generating..."} 
                icon={<Save className="h-4 w-4" />}
              />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
