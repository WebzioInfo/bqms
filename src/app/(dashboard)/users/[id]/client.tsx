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
import { updateUser, deleteUser } from "@/app/actions/user";
import { User as UserIcon, Settings, Trash2, Loader2, Save, AlertCircle, Building2, ShieldCheck, Mail, Calendar } from "lucide-react";
import Link from "next/link";

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
      router.refresh();
      setLoading(false);
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
    <div className="max-w-3xl mx-auto py-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-4 rounded-xl">
            <UserIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.name || "Unnamed User"}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={user.role.includes("ADMIN") ? "default" : "secondary"}>
                {user.role}
              </Badge>
              {user.organization && (
                <Badge variant="outline">{user.organization.name}</Badge>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.back()}>Back</Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex w-max min-w-full justify-start md:w-auto md:min-w-0">
            <TabsTrigger value="overview"><UserIcon className="h-4 w-4 mr-2" /> Overview</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-2" /> User Settings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 outline-none">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                      <dd className="mt-1 font-medium">{user.email}</dd>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">System Role</dt>
                      <dd className="mt-1 font-medium">{user.role}</dd>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Joined On</dt>
                      <dd className="mt-1 font-medium">{new Date(user.createdAt).toLocaleDateString()}</dd>
                    </div>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Organization Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Assigned Organization</p>
                        <p className="text-xs text-muted-foreground">{user.organization?.name || "System Level Access (No specific Org)"}</p>
                      </div>
                    </div>
                    {user.organizationId && (
                      <Link href={`/organizations/${user.organizationId}`}>
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
          <Card className="shadow-sm border-muted">
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle>Edit User</CardTitle>
                <CardDescription>Update profile details or modify permissions.</CardDescription>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" required defaultValue={user.name} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" name="email" type="email" disabled defaultValue={user.email} className="bg-muted" />
                    </div>
                  </div>

                  <div className="space-y-4">
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
