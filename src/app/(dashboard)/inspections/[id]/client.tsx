"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deleteInspection, updateInspection } from "@/app/actions/inspection";
import { Loader2, Save, AlertCircle, Trash2 } from "lucide-react";

export function EditInspectionClient({ inspection, organizations }: { inspection: any, organizations: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      inspectionDate: formData.get("inspectionDate") as string,
      complianceStatus: formData.get("complianceStatus") as string,
      notes: formData.get("notes") as string,
    };

    const res = await updateInspection(inspection.id, data);
    if (res.success) {
      router.push("/inspections");
      router.refresh();
    } else {
      setError(res.error || "Failed to update inspection");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this inspection?")) return;
    setDeleteLoading(true);
    const res = await deleteInspection(inspection.id);
    if (res.success) {
      router.push("/inspections");
      router.refresh();
    } else {
      setError(res.error || "Failed to delete inspection");
      setDeleteLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6 animate-in fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>← Back</Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit Inspection</h1>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle>Inspection Details</CardTitle>
            <CardDescription>Update compliance results.</CardDescription>
          </div>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteLoading}>
             {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />} Delete
          </Button>
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
                <Input id="inspectionDate" name="inspectionDate" type="date" required defaultValue={new Date(inspection.inspectionDate).toISOString().split('T')[0]} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complianceStatus">Status</Label>
                <Select name="complianceStatus" required defaultValue={inspection.complianceStatus}>
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
                <Input disabled defaultValue={inspection.organization?.name} className="bg-muted" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Inspection Notes</Label>
                <Textarea id="notes" name="notes" defaultValue={inspection.notes || ''} className="min-h-[100px]" />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Button type="button" variant="outline" className="w-full" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
