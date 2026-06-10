"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateInspection, deleteInspection } from "@/app/actions/inspection";
import { ShieldCheck, Settings, Trash2, Loader2, Save, AlertCircle, Building2, User, FileText, Download } from "lucide-react";
import Link from "next/link";

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
      organizationId: formData.get("organizationId") as string,
    };

    const res = await updateInspection(inspection.id, data);
    if (res.success) {
      router.refresh();
      setLoading(false);
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-4 rounded-xl">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inspection Record</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={inspection.complianceStatus === "PASS" ? "default" : inspection.complianceStatus === "FAIL" ? "destructive" : "secondary"}>
                {inspection.complianceStatus}
              </Badge>
              <Badge variant="outline">{new Date(inspection.inspectionDate).toLocaleDateString()}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {inspection.reportUrl && (
            <a href={inspection.reportUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Download Report</Button>
            </a>
          )}
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex w-max min-w-full justify-start md:w-auto md:min-w-0">
            <TabsTrigger value="overview"><ShieldCheck className="h-4 w-4 mr-2" /> Overview</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-2" /> Edit Inspection</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 outline-none">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Inspection Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                    <dd className="mt-1 font-medium">{inspection.complianceStatus}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Inspection Date</dt>
                    <dd className="mt-1 font-medium">{new Date(inspection.inspectionDate).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
                    <dd className="mt-1 text-sm bg-muted/50 p-3 rounded-md min-h-[80px]">
                      {inspection.notes || "No notes provided."}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Related Entities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Organization</p>
                        <p className="text-xs text-muted-foreground">{inspection.organization?.name || "Unknown"}</p>
                      </div>
                    </div>
                    {inspection.organizationId && (
                      <Link href={`/organizations/${inspection.organizationId}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Inspector</p>
                        <p className="text-xs text-muted-foreground">{inspection.inspector?.name || inspection.inspector?.email || "Unknown"}</p>
                      </div>
                    </div>
                    {inspection.inspectorId && (
                      <Link href={`/users/${inspection.inspectorId}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="outline-none">
          <Card className="shadow-sm border-muted max-w-2xl">
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle>Edit Inspection</CardTitle>
                <CardDescription>Modify inspection findings and status.</CardDescription>
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
                    <Input id="inspectionDate" name="inspectionDate" type="date" required defaultValue={inspection.inspectionDate ? new Date(inspection.inspectionDate).toISOString().split('T')[0] : ''} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="complianceStatus">Compliance Status</Label>
                    <Select name="complianceStatus" defaultValue={inspection.complianceStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PASS">PASS</SelectItem>
                        <SelectItem value="FAIL">FAIL</SelectItem>
                        <SelectItem value="PENDING">PENDING</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Inspection Notes</Label>
                    <Textarea id="notes" name="notes" rows={4} defaultValue={inspection.notes || ""} placeholder="Record any findings or observations..." />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizationId">Organization</Label>
                    <Select name="organizationId" defaultValue={inspection.organizationId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization..." />
                      </SelectTrigger>
                      <SelectContent>
                        {organizations.map(org => (
                          <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
