import { getOrganizations } from "@/app/actions/organization";
import { OrganizationsClient } from "./client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function OrganizationsPage() {
  const result = await getOrganizations();
  const organizations = result.success ? result.data : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage enterprise clients and internal divisions.</p>
        </div>
        <Link href="/organizations/new">
          <Button className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Add Organization
          </Button>
        </Link>
      </div>

      <OrganizationsClient data={organizations || []} />
    </div>
  );
}