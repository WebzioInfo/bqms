import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const prisma = new PrismaClient();

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Inspections</h1>
        {["SUPER_ADMIN", "BIOFIX_ADMIN", "INSPECTOR"].includes(userRole) && (
          <Link href="/inspections/new">
            <Button>Schedule Inspection</Button>
          </Link>
        )}
      </div>

      <div className="rounded-md border bg-white dark:bg-black">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Inspector</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inspections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No inspections found.
                </TableCell>
              </TableRow>
            ) : (
              inspections.map((insp) => (
                <TableRow key={insp.id}>
                  <TableCell className="font-medium">{insp.organization.name}</TableCell>
                  <TableCell>{insp.inspector.name || insp.inspector.email}</TableCell>
                  <TableCell>{insp.inspectionDate.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      insp.complianceStatus === "PASS" ? "default" :
                      insp.complianceStatus === "FAIL" ? "destructive" :
                      "secondary"
                    }>
                      {insp.complianceStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/inspections/${insp.id}`}>
                      <Button variant="ghost" size="sm">View Report</Button>
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
