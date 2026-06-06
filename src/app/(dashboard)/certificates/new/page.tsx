"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCertificate } from "@/app/actions/certificate";
import { getOrganizations } from "@/app/actions/organization";
import { Loader2, Award, AlertCircle } from "lucide-react";

export default function NewCertificatePage() {
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
      certificateNo: formData.get("certificateNo") as string,
      issueDate: formData.get("issueDate") as string,
      expiryDate: formData.get("expiryDate") as string,
      type: formData.get("type") as string,
      organizationId: formData.get("organizationId") as string,
    };

    if (!data.organizationId) {
      setError("Please select an organization.");
      setLoading(false);
      return;
    }

    const res = await createCertificate(data);
    if (res.success) {
      router.push("/certificates");
      router.refresh();
    } else {
      setError(res.error || "Failed to create certificate");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6 animate-in fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>← Back</Button>
        <h1 className="text-2xl font-bold tracking-tight">Issue Certificate</h1>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Certificate Details</CardTitle>
          <CardDescription>Issue a new compliance or origin certificate.</CardDescription>
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
                <Input id="certificateNo" name="certificateNo" required placeholder="CERT-2026-X99" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Certificate Type</Label>
                <Select name="type" required defaultValue="COMPLIANCE">
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
                  <Input id="issueDate" name="issueDate" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input id="expiryDate" name="expiryDate" type="date" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationId">Organization</Label>
                <Select name="organizationId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization..." />
                  </SelectTrigger>
                  <SelectContent>
                    {orgs.map(org => (
                      <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Button type="button" variant="outline" className="w-full" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Award className="h-4 w-4 mr-2" />}
                Issue Certificate
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
