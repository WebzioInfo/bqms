import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const prisma = new PrismaClient();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Batches</h1>
        {["QC_USER", "LAB_STAFF", "SUPER_ADMIN"].includes(userRole) && (
          <Link href="/batches/new">
            <Button>Log New Batch</Button>
          </Link>
        )}
      </div>

      <div className="rounded-md border bg-white dark:bg-black">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch Number</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Production Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No batches found.
                </TableCell>
              </TableRow>
            ) : (
              batches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-mono">{batch.batchNumber}</TableCell>
                  <TableCell>{batch.organization.name}</TableCell>
                  <TableCell>{batch.productionDate.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      batch.verificationStatus === "VERIFIED" ? "default" :
                      batch.verificationStatus === "REJECTED" ? "destructive" :
                      "secondary"
                    }>
                      {batch.verificationStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/batches/${batch.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
