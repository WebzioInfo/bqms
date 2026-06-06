"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateCertificate, deleteCertificate } from "@/app/actions/certificate";
import { Loader2, Save, AlertCircle, Trash2 } from "lucide-react";

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
      type: formData.get("type") as string,
      issueDate: formData.get("issueDate") as string,
      expiryDate: formData.get("expiryDate") as string,
    };

    const res = await updateCertificate(certificate.id, data);
    if (res.success) {
      router.push("/certificates");
      router.refresh();
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
    <div className="max-w-2xl mx-auto py-6 animate-in fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>← Back</Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit Certificate</h1>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle>Certificate Details</CardTitle>
            <CardDescription>Update certificate validity.</CardDescription>
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
                <Input id="certificateNo" name="certificateNo" disabled defaultValue={certificate.certificateNo} className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Certificate Type</Label>
                <Select name="type" required defaultValue={certificate.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select certificate type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPLIANCE">Compliance Certificate</SelectItem>
                    <SelectItem value="ORIGIN">Certificate of Origin</SelectItem>
                    <SelectItem value="QUALITY">Quality Certificate</SelectItem>
                    <SelectItem value="PHYTOSANITARY">Phytosanitary Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input id="issueDate" name="issueDate" type="date" required defaultValue={new Date(certificate.issueDate).toISOString().split('T')[0]} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input id="expiryDate" name="expiryDate" type="date" required defaultValue={new Date(certificate.expiryDate).toISOString().split('T')[0]} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationId">Organization</Label>
                <Input value={certificate.organization?.name || ''} disabled className="bg-muted" />
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
