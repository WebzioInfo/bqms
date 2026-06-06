import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { organization: true }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your profile and account preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-sm border-muted">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={user.name || ""} placeholder="John Doe" readOnly />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue={user.email} readOnly className="bg-muted" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">System Role</Label>
                <Input id="role" defaultValue={user.role} readOnly className="bg-muted font-mono" />
              </div>
              <Button type="button" disabled>Save Profile</Button>
            </form>
          </CardContent>
        </Card>

        {user.organization && (
          <Card className="shadow-sm border-muted">
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>The organization your account is linked to.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Organization Name</Label>
                  <Input defaultValue={user.organization.name} readOnly className="bg-muted" />
                </div>
                <div className="grid gap-2">
                  <Label>Slug</Label>
                  <Input defaultValue={user.organization.slug || "N/A"} readOnly className="bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
