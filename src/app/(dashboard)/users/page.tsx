import { getUsers } from "@/app/actions/user";
import { UsersClient } from "./client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function UsersPage() {
  const result = await getUsers();
  const users = result.success ? result.data : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage system access, roles, and company assignments.</p>
        </div>
        <Link href="/users/new">
          <Button className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </Link>
      </div>

      <UsersClient data={users || []} />
    </div>
  );
}