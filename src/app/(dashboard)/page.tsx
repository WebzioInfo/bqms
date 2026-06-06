import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { Award, Building2, ClipboardCheck, QrCode } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome to BQMS</h1>
        <p className="text-muted-foreground mt-1 text-lg">Here is an overview of your quality management metrics.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {userRole === "SUPER_ADMIN" && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
              <Building2 className="h-4 w-4 text-primary opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalOrganizations}</div>
            </CardContent>
          </Card>
        )}
        <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Certificates</CardTitle>
            <Award className="h-4 w-4 text-blue-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{activeCertificates}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-amber-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-500">{pendingVerifications}</div>
            <div className="mt-2">
               {pendingVerifications > 0 && <Badge variant="destructive" className="animate-pulse">Requires Attention</Badge>}
               {pendingVerifications === 0 && <Badge variant="secondary">All clear</Badge>}
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total QR Scans</CardTitle>
            <QrCode className="h-4 w-4 text-emerald-500 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{qrScans}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm border-muted">
          <CardHeader>
            <CardTitle className="text-xl">Recent Inspections</CardTitle>
            <CardDescription>The latest field inspections logged in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentInspections.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ClipboardCheck className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
                <p className="text-sm text-muted-foreground">No recent inspections found.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {recentInspections.map(insp => (
                  <li key={insp.id} className="flex justify-between items-center text-sm border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{insp.organization?.name || "Unknown"}</span>
                      <span className="text-muted-foreground text-xs">{new Date(insp.inspectionDate).toLocaleDateString()}</span>
                    </div>
                    <Badge variant={insp.complianceStatus === "PASS" ? "default" : "destructive"}>{insp.complianceStatus}</Badge>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 pt-4 border-t">
               <Link href="/inspections">
                 <Button variant="ghost" className="w-full text-primary">View All Inspections</Button>
               </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-muted">
          <CardHeader>
            <CardTitle className="text-xl">Recent Batches</CardTitle>
            <CardDescription>Recently produced or tracked batches.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                 <Building2 className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
                 <p className="text-sm text-muted-foreground">No recent batches found.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {recentBatches.map(batch => (
                  <li key={batch.id} className="flex justify-between items-center text-sm border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex flex-col">
                      <span className="font-semibold font-mono text-foreground">{batch.batchNumber}</span>
                      <span className="text-muted-foreground text-xs">{batch.organization?.name}</span>
                    </div>
                    <Badge variant={batch.verificationStatus === "VERIFIED" ? "default" : "secondary"}>{batch.verificationStatus}</Badge>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 pt-4 border-t">
               <Link href="/batches">
                 <Button variant="ghost" className="w-full text-primary">View All Batches</Button>
               </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
