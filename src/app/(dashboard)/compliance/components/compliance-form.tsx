"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createComplianceRecord, updateComplianceRecord } from "@/app/actions/compliance";
import { Loader2, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ComplianceFormProps {
  initialData?: any;
  organizations: any[];
  currentUserId: string;
}

import { useToast } from "@/components/ui/toast-context";
import { ButtonLoader } from "@/components/ui/button-loader";

export function ComplianceForm({ initialData, organizations, currentUserId }: ComplianceFormProps) {
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
    const type = (document.getElementById('hidden-type') as HTMLInputElement)?.value;
    const status = (document.getElementById('hidden-status') as HTMLInputElement)?.value;

    const data = {
      title: formData.get("title"),
      type: type || "AUDIT_FINDING",
      description: formData.get("description"),
      dueDate: formData.get("dueDate") || null,
      status: status || "OPEN",
      resolutionInfo: formData.get("resolutionInfo"),
      organizationId: organizationId,
    };

    if (!data.organizationId) {
      toast.error("Organization is required.");
      setError("Organization is required.");
      setIsSubmitting(false);
      return;
    }

    const res = isEditing 
      ? await updateComplianceRecord(initialData.id, data, currentUserId)
      : await createComplianceRecord(data, currentUserId);

    setIsSubmitting(false);

    if (res.success && res.data) {
      toast.success(isEditing ? "Compliance record updated successfully." : "Compliance record logged successfully.");
      router.push(`/compliance/${res.data.id}`);
    } else {
      const errMsg = res.error || "Unable to save compliance record.";
      toast.error(errMsg);
      setError(errMsg);
    }
  }

  const defaultDueDate = initialData?.dueDate 
    ? new Date(initialData.dueDate).toISOString().split('T')[0]
    : "";

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
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title / Subject <span className="text-red-500">*</span></Label>
              <Input id="title" name="title" defaultValue={initialData?.title} required placeholder="e.g. Failure to calibrate pH meter" className="bg-muted/30" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Record Type <span className="text-red-500">*</span></Label>
              <input type="hidden" name="type" id="hidden-type" defaultValue={initialData?.type || "AUDIT_FINDING"} />
              <Select defaultValue={initialData?.type || "AUDIT_FINDING"} onValueChange={(v) => { (document.getElementById('hidden-type') as HTMLInputElement).value = v }}>
                <SelectTrigger className="bg-muted/30">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUDIT_FINDING">Audit Finding</SelectItem>
                  <SelectItem value="NCR">Non-Conformance (NCR)</SelectItem>
                  <SelectItem value="CUSTOMER_COMPLAINT">Customer Complaint</SelectItem>
                  <SelectItem value="CAPA">Corrective Action (CAPA)</SelectItem>
                </SelectContent>
              </Select>
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
              <Textarea id="description" name="description" required defaultValue={initialData?.description || ""} placeholder="Detailed description of the finding or complaint..." className="bg-muted/30 min-h-[100px]" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date for Resolution</Label>
              <Input id="dueDate" name="dueDate" type="date" defaultValue={defaultDueDate} className="bg-muted/30" />
            </div>

            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="status">Current Status <span className="text-red-500">*</span></Label>
                <input type="hidden" name="status" id="hidden-status" defaultValue={initialData?.status || "OPEN"} />
                <Select defaultValue={initialData?.status || "OPEN"} onValueChange={(v) => { (document.getElementById('hidden-status') as HTMLInputElement).value = v }}>
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="IN_REVIEW">In Review</SelectItem>
                    <SelectItem value="CLOSED">Closed / Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {isEditing && (
              <div className="space-y-2 md:col-span-2 mt-4 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <Label htmlFor="resolutionInfo" className="text-emerald-800">Resolution Details / Corrective Action Taken</Label>
                <Textarea id="resolutionInfo" name="resolutionInfo" defaultValue={initialData?.resolutionInfo || ""} placeholder="Describe the actions taken to close this issue..." className="bg-white min-h-[100px] mt-2 border-emerald-200 focus-visible:ring-emerald-500" />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="button" variant="outline" className="mr-3" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <ButtonLoader 
                loading={isSubmitting} 
                label={isEditing ? "Save Changes" : "Log Record"} 
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
