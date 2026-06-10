import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { OrganizationsClient } from "./client";

export default async function OrganizationsPage() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const userRole = session?.user?.role;
  // @ts-ignore
  const orgId = session?.user?.organizationId;

  const whereClause = userRole !== "SUPER_ADMIN" && orgId ? { id: orgId } : {};

  const organizations = await prisma.organization.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage all business entities and partners.</p>
        </div>
        {userRole === "SUPER_ADMIN" && (
          <Link href="/organizations/new">
            <Button className="shadow-sm">Add Organization</Button>
          </Link>
        )}
      </div>

      <OrganizationsClient data={organizations} />
    </div>
  );
}
