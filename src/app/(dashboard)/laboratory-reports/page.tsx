import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const prisma = new PrismaClient();

export default async function LaboratoryReportsPage() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const userRole = session?.user?.role;
  // @ts-ignore
  const orgId = session?.user?.organizationId;

  const whereClause = userRole !== "SUPER_ADMIN" && orgId ? { batch: { organizationId: orgId } } : {};

  const reports = await prisma.laboratoryReport.findMany({
    where: whereClause,
    include: { batch: { include: { organization: true } } },
    orderBy: { testDate: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Laboratory Reports</h1>
        {["LAB_STAFF", "SUPER_ADMIN"].includes(userRole) && (
          <Link href="/laboratory-reports/new">
            <Button>Upload Report</Button>
          </Link>
        )}
      </div>

      <div className="rounded-md border bg-white dark:bg-black">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Test Date</TableHead>
              <TableHead>Reported By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No laboratory reports found.
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-mono">{report.batch.batchNumber}</TableCell>
                  <TableCell>{report.batch.organization.name}</TableCell>
                  <TableCell>{report.testDate.toLocaleDateString()}</TableCell>
                  <TableCell>{report.reportedBy}</TableCell>
                  <TableCell>
                    <Badge variant={report.isCompliant ? "default" : "destructive"}>
                      {report.isCompliant ? "COMPLIANT" : "NON-COMPLIANT"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/laboratory-reports/${report.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                      {report.reportFileUrl && (
                        <a href={report.reportFileUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm">Download</Button>
                        </a>
                      )}
                    </div>
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
