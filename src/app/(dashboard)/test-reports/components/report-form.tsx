"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createTestReport, updateTestReport } from "@/app/actions/report";
import { Loader2, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportFormProps {
  initialData?: any;
  organizations: any[];
  currentUserId: string;
}

export function ReportForm({ initialData, organizations, currentUserId }: ReportFormProps) {
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
    const reportType = (document.getElementById('hidden-type') as HTMLInputElement)?.value;
    const status = (document.getElementById('hidden-status') as HTMLInputElement)?.value;

    const data = {
      reportNumber: formData.get("reportNumber"),
      sampleTime: formData.get("sampleTime"),
      testedBy: formData.get("testedBy"),
      remarks: formData.get("remarks"),
      batchNumber: formData.get("batchNumber"),
      sampleNumber: formData.get("sampleNumber"),
      reportType: reportType || "PACKAGED_DRINKING_WATER",
      organizationId: organizationId,
      status: status || "DRAFT",
    };

    if (!data.organizationId || !data.batchNumber) {
      setError("Organization and Batch Number are required.");
      setIsSubmitting(false);
      return;
    }

    const res = isEditing 
      ? await updateTestReport(initialData.id, data, currentUserId)
      : await createTestReport(data, currentUserId);

    setIsSubmitting(false);

    if (res.success && res.data) {
      router.push(`/test-reports/${res.data.id}`);
    } else {
      setError(res.error || "An unknown error occurred.");
    }
  }

  const defaultDate = initialData?.sampleTime 
    ? new Date(initialData.sampleTime).toISOString().slice(0, 16)
    : new Date().toISOString().slice(0, 16);

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
              <Label htmlFor="reportNumber">Report Number</Label>
              <Input id="reportNumber" name="reportNumber" defaultValue={initialData?.reportNumber} placeholder="Leave empty to auto-generate" className="bg-muted/30" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sampleTime">Sample Time <span className="text-red-500">*</span></Label>
              <Input id="sampleTime" name="sampleTime" type="datetime-local" defaultValue={defaultDate} required className="bg-muted/30" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="testedBy">Tested By (Analyst Name) <span className="text-red-500">*</span></Label>
              <Input id="testedBy" name="testedBy" defaultValue={initialData?.testedBy} required placeholder="John Analyst" className="bg-muted/30" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number <span className="text-red-500">*</span></Label>
              <Input id="batchNumber" name="batchNumber" defaultValue={initialData?.batchNumber} required placeholder="e.g. EB26175" className="bg-muted/30" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sampleNumber">Sample Number</Label>
              <Input id="sampleNumber" name="sampleNumber" defaultValue={initialData?.sampleNumber} placeholder="e.g. SMPL-001" className="bg-muted/30" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type <span className="text-red-500">*</span></Label>
              <input type="hidden" name="reportType" id="hidden-type" defaultValue={initialData?.reportType || "PACKAGED_DRINKING_WATER"} />
              <Select defaultValue={initialData?.reportType || "PACKAGED_DRINKING_WATER"} onValueChange={(v) => { (document.getElementById('hidden-type') as HTMLInputElement).value = v }}>
                <SelectTrigger className="bg-muted/30">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PACKAGED_DRINKING_WATER">Packaged Drinking Water</SelectItem>
                  <SelectItem value="RAW_WATER">Raw Water</SelectItem>
                  <SelectItem value="SOURCE_WATER">Source Water</SelectItem>
                  <SelectItem value="PROCESS_WATER">Process Water</SelectItem>
                  <SelectItem value="MICROBIOLOGY">Microbiology</SelectItem>
                  <SelectItem value="CHEMICAL">Chemical</SelectItem>
                  <SelectItem value="PHYSICAL">Physical</SelectItem>
                  <SelectItem value="COMBINED">Combined Final Report</SelectItem>
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

            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="status">Report Status <span className="text-red-500">*</span></Label>
                <input type="hidden" name="status" id="hidden-status" defaultValue={initialData?.status || "DRAFT"} />
                <Select defaultValue={initialData?.status || "DRAFT"} onValueChange={(v) => { (document.getElementById('hidden-status') as HTMLInputElement).value = v }}>
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="REVIEWED">Reviewed</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="RETEST_REQUIRED">Retest Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="remarks">Remarks / Observations</Label>
              <Input id="remarks" name="remarks" defaultValue={initialData?.remarks || ""} placeholder="Any additional notes..." className="bg-muted/30" />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="button" variant="outline" className="mr-3" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isEditing ? "Save Changes" : "Create Report"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
