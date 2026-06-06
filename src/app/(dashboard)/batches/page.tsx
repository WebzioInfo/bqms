import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function BatchesPage() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const userRole = session?.user?.role;
  // @ts-ignore
  const orgId = session?.user?.organizationId;

  const whereClause = userRole !== "SUPER_ADMIN" && orgId ? { organizationId: orgId } : {};

  const batches = await prisma.batch.findMany({
    where: whereClause,
    include: { organization: true },
    orderBy: { createdAt: "desc" }
  });

  const columns: Column<any>[] = [
    {
      key: "batchNumber",
      header: "Batch Number",
      cell: (batch) => <span className="font-mono">{batch.batchNumber}</span>
    },
    {
      key: "organization",
      header: "Organization",
      cell: (batch) => <span>{batch.organization.name}</span>
    },
    {
      key: "productionDate",
      header: "Production Date",
      cell: (batch) => <span>{batch.productionDate.toLocaleDateString()}</span>
    },
    {
      key: "status",
      header: "Status",
      cell: (batch) => (
        <Badge variant={
          batch.verificationStatus === "VERIFIED" ? "default" :
          batch.verificationStatus === "REJECTED" ? "destructive" :
          "secondary"
        }>
          {batch.verificationStatus}
        </Badge>
      )
    },
    {
      key: "actions",
      header: "Actions",
      cell: (batch) => (
        <div className="flex items-center gap-2 justify-end">
          <Link href={`/batches/${batch.id}`}>
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
          <h1 className="text-3xl font-bold tracking-tight">Batches</h1>
          <p className="text-muted-foreground mt-1 text-sm">Track and manage production batches.</p>
        </div>
        {["QC_USER", "LAB_STAFF", "SUPER_ADMIN"].includes(userRole) && (
          <div className="ml-auto flex items-center gap-2">
            <Link href="/batches/new">
              <Button className="shadow-sm">Log New Batch</Button>
            </Link>
          </div>
        )}
      </div>

      <DataTable 
        columns={columns} 
        data={batches} 
        searchKey="batchNumber"
        searchPlaceholder="Search by batch number..."
        emptyMessage="No batches found."
      />
    </div>
  );
}
