"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addLaboratoryReport } from "@/app/actions/batch";
import { getOrganizations } from "@/app/actions/organization";
import { Loader2, FileText, AlertCircle } from "lucide-react";

export default function NewLaboratoryReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      batchId: formData.get("batchId") as string,
      testDate: new Date(formData.get("testDate") as string),
      reportedBy: formData.get("reportedBy") as string,
      parameters: [] // Complex payload usually required here
    };

    if (!data.batchId) {
      setError("Please select a batch.");
      setLoading(false);
      return;
    }

    const res = await addLaboratoryReport(data);
    if (res.success) {
      router.push("/laboratory-reports");
      router.refresh();
    } else {
      setError(res.error || "Failed to upload report");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6 animate-in fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>← Back</Button>
        <h1 className="text-2xl font-bold tracking-tight">Upload Lab Report</h1>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
          <CardDescription>Upload test results for a specific production batch.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 flex gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h4 className="font-semibold">Error</h4>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="batchId">Batch ID</Label>
                <Input id="batchId" name="batchId" required placeholder="Enter Batch ID..." />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="testDate">Test Date</Label>
                <Input id="testDate" name="testDate" type="date" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportedBy">Reported By</Label>
                <Input id="reportedBy" name="reportedBy" required placeholder="e.g. Dr. Smith" />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Button type="button" variant="outline" className="w-full" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                Upload Report
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
