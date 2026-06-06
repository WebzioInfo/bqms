"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createInspection } from "@/app/actions/inspection";
import { getOrganizations } from "@/app/actions/organization";
import { Loader2, ClipboardCheck, AlertCircle } from "lucide-react";

export default function NewInspectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgs, setOrgs] = useState<any[]>([]);

  useEffect(() => {
    getOrganizations().then((res) => {
      if (res.success && res.organizations) setOrgs(res.organizations);
    });
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      inspectionDate: new Date(formData.get("inspectionDate") as string),
      complianceStatus: formData.get("complianceStatus") as string,
      organizationId: formData.get("organizationId") as string,
      notes: formData.get("notes") as string,
      inspectorId: "system", // Normally read from session, but for demo
    };

    if (!data.organizationId) {
      setError("Please select an organization.");
      setLoading(false);
      return;
    }

    const res = await createInspection(data as any);
    if (res.success) {
      router.push("/inspections");
      router.refresh();
    } else {
      setError(res.error || "Failed to log inspection");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6 animate-in fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>← Back</Button>
        <h1 className="text-2xl font-bold tracking-tight">Schedule Inspection</h1>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Inspection Details</CardTitle>
          <CardDescription>Log a new compliance inspection record.</CardDescription>
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
                <Label htmlFor="inspectionDate">Inspection Date</Label>
                <Input id="inspectionDate" name="inspectionDate" type="date" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complianceStatus">Status</Label>
                <Select name="complianceStatus" required defaultValue="PASSED">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PASSED">Passed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="WARNING">Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationId">Organization</Label>
                <Select name="organizationId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target..." />
                  </SelectTrigger>
                  <SelectContent>
                    {orgs.map(org => (
                      <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Inspection Notes</Label>
                <Textarea id="notes" name="notes" placeholder="Detailed findings..." className="min-h-[100px]" />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Button type="button" variant="outline" className="w-full" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ClipboardCheck className="h-4 w-4 mr-2" />}
                Log Inspection
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
