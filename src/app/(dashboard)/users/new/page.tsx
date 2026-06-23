import { UserForm } from "../components/user-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOrganizations } from "@/app/actions/organization";

export default async function NewUserPage() {
  const result = await getOrganizations();
  const organizations = result.success ? result.data : [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/users">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
          <p className="text-muted-foreground mt-1 text-sm">Add a new user and assign them to an organization.</p>
        </div>
      </div>

      <UserForm organizations={organizations || []} />
    </div>
  );
}