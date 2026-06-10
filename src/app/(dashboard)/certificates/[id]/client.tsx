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
import { updateCertificate, deleteCertificate } from "@/app/actions/certificate";
import { FileSignature, Download, Settings, Trash2, Loader2, Save, AlertCircle, Building2, PackageSearch } from "lucide-react";
import Link from "next/link";

export function EditCertificateClient({ certificate, organizations }: { certificate: any, organizations: any[] }) {
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
      certificateNo: formData.get("certificateNo") as string,
      status: formData.get("status") as string,
      organizationId: formData.get("organizationId") as string,
      issueDate: formData.get("issueDate") as string,
      expiryDate: formData.get("expiryDate") as string || undefined,
    };

    const res = await updateCertificate(certificate.id, data);
    if (res.success) {
      router.refresh();
      setLoading(false);
    } else {
      setError(res.error || "Failed to update certificate");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this certificate?")) return;
    setDeleteLoading(true);
    const res = await deleteCertificate(certificate.id);
    if (res.success) {
      router.push("/certificates");
      router.refresh();
    } else {
      setError(res.error || "Failed to delete certificate");
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-4 rounded-xl">
            <FileSignature className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Certificate {certificate.certificateNo}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={certificate.status === "ACTIVE" ? "default" : certificate.status === "REVOKED" ? "destructive" : "secondary"}>
                {certificate.status}
              </Badge>
              <Badge variant="outline">{certificate.organization.name}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {certificate.pdfUrl && (
            <a href={certificate.pdfUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Download PDF</Button>
            </a>
          )}
          <Button variant="outline" onClick={() => router.back()}>Back</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex w-max min-w-full justify-start md:w-auto md:min-w-0">
            <TabsTrigger value="overview"><FileSignature className="h-4 w-4 mr-2" /> Overview</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-2" /> Edit Certificate</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 outline-none">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Certificate Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Issue Date</dt>
                    <dd className="mt-1 font-medium">{new Date(certificate.issueDate).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Expiry Date</dt>
                    <dd className="mt-1 font-medium">{certificate.expiryDate ? new Date(certificate.expiryDate).toLocaleDateString() : "Never"}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                    <dd className="mt-1 font-medium">{certificate.status}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Linked Entities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Organization</p>
                        <p className="text-xs text-muted-foreground">{certificate.organization.name}</p>
                      </div>
                    </div>
                    <Link href={`/organizations/${certificate.organizationId}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                  
                  {certificate.batch && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <PackageSearch className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">Batch Target</p>
                          <p className="text-xs text-muted-foreground">{certificate.batch.batchNumber}</p>
                        </div>
                      </div>
                      <Link href={`/batches/${certificate.batchId}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="outline-none">
          <Card className="shadow-sm border-muted max-w-2xl">
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle>Edit Certificate</CardTitle>
                <CardDescription>Modify certificate details and status.</CardDescription>
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
                    <Label htmlFor="certificateNo">Certificate Number</Label>
                    <Input id="certificateNo" name="certificateNo" required defaultValue={certificate.certificateNo} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={certificate.status}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="REVOKED">Revoked</SelectItem>
                        <SelectItem value="EXPIRED">Expired</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="issueDate">Issue Date</Label>
                      <Input id="issueDate" name="issueDate" type="date" required defaultValue={certificate.issueDate ? new Date(certificate.issueDate).toISOString().split('T')[0] : ''} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input id="expiryDate" name="expiryDate" type="date" defaultValue={certificate.expiryDate ? new Date(certificate.expiryDate).toISOString().split('T')[0] : ''} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizationId">Organization</Label>
                    <Select name="organizationId" defaultValue={certificate.organizationId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select owner..." />
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
