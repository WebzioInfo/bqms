"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateQRCodes } from "@/app/actions/qrcode";
import { getOrganizations } from "@/app/actions/organization";
import { Loader2, QrCode, AlertCircle } from "lucide-react";

export default function GenerateQRCodesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");

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
      count: parseInt(formData.get("count") as string, 10),
      organizationId: selectedOrgId,
    };

    if (!data.organizationId) {
      setError("Please select an organization.");
      setLoading(false);
      return;
    }

    const res = await generateQRCodes(data.organizationId, null, data.count);
    if (res.success) {
      router.push("/dashboard/qr-codes");
      router.refresh();
    } else {
      setError(res.error || "Failed to generate QR codes");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6 animate-in fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>← Back</Button>
        <h1 className="text-2xl font-bold tracking-tight">Generate QR Codes</h1>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>QR Generation</CardTitle>
          <CardDescription>Create a batch of secure, trackable QR codes for products.</CardDescription>
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
                <Label htmlFor="count">Number of Codes to Generate</Label>
                <Input id="count" name="count" type="number" min="1" max="1000" required defaultValue="10" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationId">Organization</Label>
                <Select required value={selectedOrgId} onValueChange={(val) => setSelectedOrgId(val as string)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target organization..." />
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
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <QrCode className="h-4 w-4 mr-2" />}
                Generate Codes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
