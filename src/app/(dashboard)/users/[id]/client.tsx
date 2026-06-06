"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateUser, deleteUser } from "@/app/actions/user";
import { Loader2, Save, AlertCircle, Trash2 } from "lucide-react";

export function EditUserClient({ user, organizations }: { user: any, organizations: any[] }) {
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
      name: formData.get("name") as string,
      role: formData.get("role") as string,
      organizationId: formData.get("organizationId") as string || undefined,
    };
    
    if (data.organizationId === "none") data.organizationId = undefined;

    const res = await updateUser(user.id, data);
    if (res.success) {
      router.push("/users");
      router.refresh();
    } else {
      setError(res.error || "Failed to update user");
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setDeleteLoading(true);
    const res = await deleteUser(user.id);
    if (res.success) {
      router.push("/users");
      router.refresh();
    } else {
      setError(res.error || "Failed to delete user");
      setDeleteLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6 animate-in fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>← Back</Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit User</h1>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle>User Details</CardTitle>
            <CardDescription>Update profile details or permissions.</CardDescription>
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
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required defaultValue={user.name} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" disabled defaultValue={user.email} className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" required defaultValue={user.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    <SelectItem value="BIOFIX_ADMIN">Biofix Admin</SelectItem>
                    <SelectItem value="INSPECTOR">Inspector</SelectItem>
                    <SelectItem value="QC_USER">QC User</SelectItem>
                    <SelectItem value="LAB_STAFF">Lab Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationId">Organization</Label>
                <Select name="organizationId" defaultValue={user.organizationId || "none"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Link to an organization..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None / System Level</SelectItem>
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
