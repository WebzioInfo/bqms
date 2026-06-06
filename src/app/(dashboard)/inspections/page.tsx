import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function InspectionsPage() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const userRole = session?.user?.role;
  // @ts-ignore
  const orgId = session?.user?.organizationId;
  // @ts-ignore
  const userId = session?.user?.id;

  const whereClause = 
    userRole === "INSPECTOR" ? { inspectorId: userId } :
    userRole !== "SUPER_ADMIN" && orgId ? { organizationId: orgId } : {};

  const inspections = await prisma.inspection.findMany({
    where: whereClause,
    include: { organization: true, inspector: true },
    orderBy: { inspectionDate: "desc" }
  });

  const columns: Column<any>[] = [
    {
      key: "organization",
      header: "Organization",
      cell: (insp) => <span className="font-medium">{insp.organization.name}</span>
    },
    {
      key: "inspector",
      header: "Inspector",
      cell: (insp) => <span>{insp.inspector.name || insp.inspector.email}</span>
    },
    {
      key: "date",
      header: "Date",
      cell: (insp) => <span>{insp.inspectionDate.toLocaleDateString()}</span>
    },
    {
      key: "status",
      header: "Status",
      cell: (insp) => (
        <Badge variant={
          insp.complianceStatus === "PASS" ? "default" :
          insp.complianceStatus === "FAIL" ? "destructive" :
          "secondary"
        }>
          {insp.complianceStatus}
        </Badge>
      )
    },
    {
      key: "actions",
      header: "Actions",
      cell: (insp) => (
        <div className="flex justify-end gap-2">
          <Link href={`/inspections/${insp.id}`}>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">View Details</Button>
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inspections</h1>
          <p className="text-muted-foreground mt-1 text-sm">Review and manage field inspection reports.</p>
        </div>
        {["SUPER_ADMIN", "BIOFIX_ADMIN", "INSPECTOR"].includes(userRole) && (
          <div className="ml-auto flex items-center gap-2">
            <Link href="/inspections/new">
              <Button className="shadow-sm">Schedule Inspection</Button>
            </Link>
          </div>
        )}
      </div>

      <DataTable 
        columns={columns} 
        data={inspections} 
        searchKey="organization.name"
        searchPlaceholder="Search inspections..."
        emptyMessage="No inspections found."
      />
    </div>
  );
}
