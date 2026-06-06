import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const userRole = session?.user?.role;
  // @ts-ignore
  const orgId = session?.user?.organizationId;

  const whereClause = userRole !== "SUPER_ADMIN" && orgId ? { organizationId: orgId } : {};

  const [
    totalOrganizations,
    activeCertificates,
    pendingVerifications,
    recentInspections,
    recentBatches,
    qrScans,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.certificate.count({ where: { status: "ACTIVE", ...whereClause } }),
    prisma.batch.count({ where: { verificationStatus: "PENDING", ...whereClause } }),
    prisma.inspection.findMany({ where: whereClause, take: 5, orderBy: { createdAt: "desc" }, include: { organization: true } }),
    prisma.batch.findMany({ where: whereClause, take: 5, orderBy: { createdAt: "desc" }, include: { organization: true } }),
    prisma.verificationScan.count(), // Depending on scope
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrganizations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCertificates}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingVerifications}</div>
            <div className="mt-1">
               {pendingVerifications > 0 && <Badge variant="secondary">Requires Attention</Badge>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total QR Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qrScans}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Inspections</CardTitle>
          </CardHeader>
          <CardContent>
            {recentInspections.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent inspections found.</p>
            ) : (
              <ul className="space-y-3">
                {recentInspections.map(insp => (
                  <li key={insp.id} className="flex justify-between items-center text-sm">
                    <span>{insp.organization?.name || "Unknown"}</span>
                    <Badge variant={insp.complianceStatus === "PASS" ? "default" : "destructive"}>{insp.complianceStatus}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Batches</CardTitle>
          </CardHeader>
          <CardContent>
            {recentBatches.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent batches found.</p>
            ) : (
              <ul className="space-y-3">
                {recentBatches.map(batch => (
                  <li key={batch.id} className="flex justify-between items-center text-sm">
                    <span>{batch.batchNumber} - {batch.organization?.name}</span>
                    <Badge variant="outline">{batch.verificationStatus}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
