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
import { updateBatch, deleteBatch } from "@/app/actions/batch";
import { PackageSearch, Beaker, FileSignature, QrCode, Settings, Trash2, Loader2, Save, AlertCircle } from "lucide-react";
import Link from "next/link";
import { DataTable, Column } from "@/components/ui/data-table";

export function EditBatchClient({ batch, organizations }: { batch: any, organizations: any[] }) {
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
      batchNumber: formData.get("batchNumber") as string,
      productionDate: formData.get("productionDate") as string,
      organizationId: formData.get("organizationId") as string,
    };

    const res = await updateBatch(batch.id, data);
    if (res.success) {
      router.refresh();
      setLoading(false);
    } else {
      setError(res.error || "Failed to update batch");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this batch?")) return;
    setDeleteLoading(true);
    const res = await deleteBatch(batch.id);
    if (res.success) {
      router.push("/batches");
      router.refresh();
    } else {
      setError(res.error || "Failed to delete batch");
      setDeleteLoading(false);
    }
  }

  const labReportColumns: Column<any>[] = [
    { key: "testDate", header: "Date", cell: (r) => new Date(r.testDate).toLocaleDateString() },
    { key: "reportedBy", header: "Lab", cell: (r) => r.reportedBy },
    { key: "compliant", header: "Compliance", cell: (r) => <Badge variant={r.isCompliant ? "default" : "destructive"}>{r.isCompliant ? "Compliant" : "Failed"}</Badge> },
    { key: "actions", header: "Actions", cell: (r) => <div className="flex justify-end"><Link href={`/laboratory-reports/${r.id}`}><Button variant="ghost" size="sm">View</Button></Link></div> }
  ];

  const certificateColumns: Column<any>[] = [
    { key: "certificateNo", header: "Cert Number", cell: (c) => <span className="font-mono">{c.certificateNo}</span> },
    { key: "status", header: "Status", cell: (c) => <Badge variant={c.status === "ACTIVE" ? "default" : "destructive"}>{c.status}</Badge> },
    { key: "actions", header: "Actions", cell: (c) => <div className="flex justify-end"><Link href={`/certificates/${c.id}`}><Button variant="ghost" size="sm">Details</Button></Link></div> }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-4 rounded-xl">
            <PackageSearch className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Batch {batch.batchNumber}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={batch.verificationStatus === "VERIFIED" ? "default" : batch.verificationStatus === "REJECTED" ? "destructive" : "secondary"}>
                {batch.verificationStatus}
              </Badge>
              <Badge variant="outline">{batch.organization.name}</Badge>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.back()}>Back</Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex w-max min-w-full justify-start md:w-auto md:min-w-0">
            <TabsTrigger value="overview"><PackageSearch className="h-4 w-4 mr-2" /> Overview</TabsTrigger>
            <TabsTrigger value="labreports"><Beaker className="h-4 w-4 mr-2" /> Lab Reports</TabsTrigger>
            <TabsTrigger value="certificates"><FileSignature className="h-4 w-4 mr-2" /> Certificates</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-2" /> Settings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 outline-none">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Production Date</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{new Date(batch.productionDate).toLocaleDateString()}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Lab Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{batch.labReports?.length || 0}</div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{batch.certificates?.length || 0}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="labreports" className="outline-none">
          <Card className="shadow-sm border-muted">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Laboratory Reports</CardTitle>
                <CardDescription>Tests associated with this batch.</CardDescription>
              </div>
              <Link href={`/laboratory-reports/new?batchId=${batch.id}`}>
                <Button size="sm">Add Report</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={labReportColumns} 
                data={batch.labReports || []} 
                searchKey="reportedBy"
                searchPlaceholder="Search lab..."
                emptyMessage="No reports found."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="outline-none">
          <Card className="shadow-sm border-muted">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Certificates</CardTitle>
                <CardDescription>Certificates granted to this batch.</CardDescription>
              </div>
              <Link href={`/certificates/new?batchId=${batch.id}`}>
                <Button size="sm">Issue Cert</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={certificateColumns} 
                data={batch.certificates || []} 
                searchKey="certificateNo"
                searchPlaceholder="Search certificates..."
                emptyMessage="No certificates found."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="outline-none">
          <Card className="shadow-sm border-muted max-w-2xl">
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle>Edit Batch</CardTitle>
                <CardDescription>Update manufacturing tracking data.</CardDescription>
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
                    <Label htmlFor="batchNumber">Batch/Lot Number</Label>
                    <Input id="batchNumber" name="batchNumber" required defaultValue={batch.batchNumber} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="productionDate">Production Date</Label>
                    <Input id="productionDate" name="productionDate" type="date" required defaultValue={batch.productionDate ? new Date(batch.productionDate).toISOString().split('T')[0] : ''} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizationId">Organization</Label>
                    <Select name="organizationId" defaultValue={batch.organizationId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manufacturer..." />
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
