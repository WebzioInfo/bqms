import { UserForm } from "../../components/user-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getUserById } from "@/app/actions/user";
import { getOrganizations } from "@/app/actions/organization";
import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/tenant-access";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let currentUser;
  try {
    currentUser = await getAuthenticatedUser();
  } catch (error) {
    redirect("/login");
  }

  const [userResult, orgResult] = await Promise.all([
    getUserById(id),
    getOrganizations()
  ]);

  if (!userResult.success || !userResult.data) {
    notFound();
  }

  const organizations = orgResult.success ? orgResult.data : [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href={`/users/${id}`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
          <p className="text-muted-foreground mt-1 text-sm">Update user details and access permissions.</p>
        </div>
      </div>

      <UserForm initialData={userResult.data} organizations={organizations || []} currentUserRole={currentUser.role} />
    </div>
  );
}