import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Name",
      cell: (org) => <span className="font-medium">{org.name}</span>
    },
    {
      key: "type",
      header: "Type",
      cell: (org) => <Badge variant="outline">{org.type}</Badge>
    },
    {
      key: "erp",
      header: "ERP Reference",
      cell: (org) => <span>{org.erpReferenceId || "N/A"}</span>
    },
    {
      key: "trustScore",
      header: "Trust Score",
      cell: (org) => (
        org.trustScore !== null ? (
          <span className={org.trustScore >= 80 ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
            {org.trustScore.toFixed(1)}
          </span>
        ) : "N/A"
      )
    },
    {
      key: "actions",
      header: "Actions",
      cell: (org) => (
        <div className="flex justify-end">
          <Link href={`/organizations/${org.id}`}>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">View Details</Button>
          </Link>
        </div>
      )
    }
  ];

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

      <DataTable 
        columns={columns} 
        data={organizations} 
        searchKey="name"
        searchPlaceholder="Search by organization name..."
        emptyMessage="No organizations found."
      />
    </div>
  );
}
