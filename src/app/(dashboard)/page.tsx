import { getDashboardMetrics } from "@/app/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Beaker, ShieldCheck, Database } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

type SessionWithRole = {
  user?: {
    role?: Role;
  };
};

type RecentDashboardReport = {
  id: string;
  reportNumber: string;
  batchNumber: string | null;
  createdAt: Date | string;
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = (session as SessionWithRole).user?.role;
  const { data: metrics } = await getDashboardMetrics();

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {role === "PLATFORM_ADMIN" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalOrganizations || 0}</div>
              <p className="text-xs text-muted-foreground">Active tenants on platform</p>
            </CardContent>
          </Card>
        )}
        
        {role !== "QC" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalCertificates || 0}</div>
              <p className="text-xs text-muted-foreground">Total compliance certificates</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Reports</CardTitle>
            <Beaker className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalReports || 0}</div>
            <p className="text-xs text-muted-foreground">Lab tests conducted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Issues</CardTitle>
            <ShieldCheck className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics?.totalComplianceIssues || 0}</div>
            <p className="text-xs text-muted-foreground">Open NCRs or CAPAs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Test Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {metrics?.recentReports?.length ? metrics.recentReports.map((report: RecentDashboardReport) => (
                <div key={report.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <Link href={`/test-reports/${report.id}`} className="text-sm font-medium leading-none hover:underline">
                      {report.reportNumber}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Batch reference: {report.batchNumber || "Not recorded"}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )) : (
                <div className="text-sm text-muted-foreground">No recent reports found.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
