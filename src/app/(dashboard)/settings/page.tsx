import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = ((session as any).user as any).role;
  const organizationId = ((session as any).user as any).organizationId;

  let org = null;
  if (organizationId) {
    org = await prisma.organization.findUnique({ where: { id: organizationId } });
  }

  return (
    <div className="flex-1 space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      {role === "PLATFORM_ADMIN" ? (
        <Card>
          <CardHeader>
            <CardTitle>Global Platform Settings</CardTitle>
            <CardDescription>Configure application-wide parameters.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
               <label className="text-sm font-medium">Default Retention Period (Days)</label>
               <Input defaultValue="365" />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">Max Upload Size (MB)</label>
               <Input defaultValue="50" />
             </div>
             <Button>Save Settings</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Organization Settings</CardTitle>
            <CardDescription>Manage your company profile and preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
               <label className="text-sm font-medium">Company Name</label>
               <Input defaultValue={org?.name || ""} disabled />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">License Number (BIS)</label>
               <Input defaultValue={org?.licenseNumber || ""} disabled />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">Contact Email</label>
               <Input defaultValue={org?.contactEmail || ""} />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">Address</label>
               <Input defaultValue={org?.address || ""} />
             </div>
             <Button>Update Organization</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
