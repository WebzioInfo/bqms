"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrganization, deleteOrganization } from "@/app/actions/organization";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Trash2, Building2, ShieldCheck, FileSignature, QrCode, Activity, Users } from "lucide-react";
import Link from "next/link";
import { EntityType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

export function EditOrganizationClient({ organization }: { organization: any }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: organization.name || "",
    slug: organization.slug || "",
    type: organization.type || "MINERAL_WATER",
    email: organization.email || "",
    phone: organization.phone || "",
    address: organization.address || "",
    erpReferenceId: organization.erpReferenceId || "",
    trustScore: organization.trustScore?.toString() || ""
  });

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        type: formData.type as EntityType,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        erpReferenceId: formData.erpReferenceId || null,
        trustScore: formData.trustScore ? parseFloat(formData.trustScore) : null
      };

      const result = await updateOrganization(organization.id, payload);

      if (result.success) {
        // Ideally show a toast here
        router.push(`/organizations/${organization.id}`);
        router.refresh();
      } else {
        setError(result.error || "Failed to save organization.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you absolutely sure you want to delete ${organization.name}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteOrganization(organization.id);
      if (result.success) {
        router.push("/organizations");
        router.refresh();
      } else {
        setError(result.error || "Failed to delete organization.");
        setIsDeleting(false);
      }
    } catch (err: any) {
      setError(err.message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href={`/organizations/${organization.id}`}>
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Organization</h1>
          <p className="text-muted-foreground">Modify details for {organization.name}</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md font-medium text-sm border border-destructive/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Profile</CardTitle>
              <CardDescription>Public details and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Internal Slug</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Organization Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MINERAL_WATER">Mineral Water</SelectItem>
                      <SelectItem value="RESTAURANT">Restaurant</SelectItem>
                      <SelectItem value="HOTEL">Hotel</SelectItem>
                      <SelectItem value="CAFE">Cafe</SelectItem>
                      <SelectItem value="INSTITUTION">Institution</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Physical Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Integration</CardTitle>
              <CardDescription>ERP and verification settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ERP Reference ID</Label>
                  <Input
                    value={formData.erpReferenceId}
                    onChange={(e) => setFormData({ ...formData, erpReferenceId: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Manual Trust Score</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.trustScore}
                    onChange={(e) => setFormData({ ...formData, trustScore: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t pt-4">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Related Records</CardTitle>
              <CardDescription>Data associated with this entity.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex justify-between items-center text-sm"><span className="flex items-center"><Users className="h-4 w-4 mr-2 text-muted-foreground" /> Users</span> <Badge variant="secondary">{organization._count?.users || 0}</Badge></li>
                <Separator />
                <li className="flex justify-between items-center text-sm"><span className="flex items-center"><Activity className="h-4 w-4 mr-2 text-muted-foreground" /> Batches</span> <Badge variant="secondary">{organization._count?.batches || 0}</Badge></li>
                <Separator />
                <li className="flex justify-between items-center text-sm"><span className="flex items-center"><ShieldCheck className="h-4 w-4 mr-2 text-muted-foreground" /> Inspections</span> <Badge variant="secondary">{organization._count?.inspections || 0}</Badge></li>
                <Separator />
                <li className="flex justify-between items-center text-sm"><span className="flex items-center"><QrCode className="h-4 w-4 mr-2 text-muted-foreground" /> QR Codes</span> <Badge variant="secondary">{organization._count?.qrCodes || 0}</Badge></li>
                <Separator />
                <li className="flex justify-between items-center text-sm"><span className="flex items-center"><FileSignature className="h-4 w-4 mr-2 text-muted-foreground" /> Certificates</span> <Badge variant="secondary">{organization._count?.certificates || 0}</Badge></li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Deleting this organization will permanently remove all associated Batches, Inspections, Certificates, and QR Codes.
              </p>
              <Button variant="destructive" className="w-full" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete Organization"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
