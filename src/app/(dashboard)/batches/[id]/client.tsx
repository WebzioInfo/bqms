"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateBatch, deleteBatch } from "@/app/actions/batch";
import { Loader2, Save, AlertCircle, Trash2 } from "lucide-react";

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
      router.push("/batches");
      router.refresh();
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

  return (
    <div className="max-w-2xl mx-auto py-6 animate-in fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>← Back</Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit Batch</h1>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle>Batch Details</CardTitle>
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
