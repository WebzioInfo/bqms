import { getAuthenticatedUser } from "@/lib/auth/tenant-access";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function SecurityPage() {
  let user;
  try {
    user = await getAuthenticatedUser();
  } catch (error) {
    redirect("/login");
  }

  return (
    <div className="flex-1 space-y-4 max-w-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Security & Profile</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password securely.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input type="password" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input type="password" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm New Password</label>
              <Input type="password" />
            </div>
            <Button>Update Password</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your current login sessions.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex justify-between items-center py-2 border-b">
             <div>
               <p className="font-medium text-sm">Windows • Chrome</p>
               <p className="text-xs text-muted-foreground">Current Session</p>
             </div>
             <span className="text-xs text-green-500 font-medium">Active Now</span>
           </div>
           <Button variant="outline" className="mt-4 text-destructive border-destructive hover:bg-destructive/10">Revoke All Other Sessions</Button>
        </CardContent>
      </Card>
    </div>
  );
}