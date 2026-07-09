import { getDashboardMetrics } from "@/app/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Beaker, ShieldCheck, Database, AlertCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { getPendingLabTestsForDashboard } from "@/app/actions/reminder";
import { getAuthenticatedUser } from "@/lib/auth/tenant-access";
import { Suspense } from "react";
import { CardSkeleton, ListSkeleton } from "@/components/ui/skeletons";

type RecentDashboardReport = {
  id: string;
  reportNumber: string;
  batchNumber: string | null;
  createdAt: Date | string;
};

export default async function DashboardPage() {
  let user;
  try {
    user = await getAuthenticatedUser();
  } catch (error) {
    redirect("/login");
  }

  const role = user.role;

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
      </div>
      
      <Suspense fallback={
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
            <div className="col-span-4"><ListSkeleton items={4} /></div>
            <div className="col-span-3"><ListSkeleton items={4} /></div>
          </div>
        </div>
      }>
        <DashboardContent role={role} />
      </Suspense>
    </div>
  );
}

async function DashboardContent({ role }: { role: string }) {
  const [{ data: metrics }, { data: pendingTests }] = await Promise.all([
    getDashboardMetrics(),
    getPendingLabTestsForDashboard()
  ]);

  return (
    <>
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

      {/* Quality Warning Engine metrics */}
      <div className="grid gap-4 md:grid-cols-3 mt-4">
        <Card className="bg-emerald-50/20 border-emerald-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-800">Reports Passed</CardTitle>
            <Beaker className="h-4.5 w-4.5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{metrics?.reportsPassed || 0}</div>
            <p className="text-[10px] text-emerald-650 font-bold mt-0.5">Compliant with BIS standards</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/30 border-amber-200/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-800">Reports With Warnings</CardTitle>
            <AlertCircle className="h-4.5 w-4.5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{metrics?.reportsWithWarnings || 0}</div>
            <p className="text-[10px] text-amber-655 font-bold mt-0.5">Exceeds standard but within tolerance</p>
          </CardContent>
        </Card>

        <Card className="bg-rose-50/20 border-rose-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-rose-800">Reports Failed</CardTitle>
            <AlertTriangle className="h-4.5 w-4.5 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700">{metrics?.reportsFailed || 0}</div>
            <p className="text-[10px] text-rose-650 font-bold mt-0.5">Exceeds critical limits</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4 font-sans">
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

        {/* Dashboard Widget for Pending Lab Tests */}
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b">
            <div>
              <CardTitle className="text-sm font-bold text-slate-800">Pending Laboratory Results</CardTitle>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">Microbiology tracking</p>
            </div>
            <div className="text-[10px] font-black text-slate-500 bg-slate-100 border px-2 py-0.5 rounded">
              {pendingTests?.length || 0} Pending
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
              {pendingTests && pendingTests.length > 0 ? (
                pendingTests.map((test: any) => {
                  let priorityColor = "bg-slate-50 text-slate-650 border-slate-200";
                  if (test.priority === "Critical") priorityColor = "bg-rose-50 text-rose-700 border-rose-200 animate-pulse font-black";
                  else if (test.priority === "High") priorityColor = "bg-amber-50 text-amber-700 border-amber-250 font-bold";

                  return (
                    <div key={test.id} className="p-4 flex flex-col gap-2 hover:bg-slate-50/30 transition-colors">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <Link href={`/test-reports/${test.reportId}`} className="text-xs font-bold text-slate-800 hover:underline hover:text-sky-700 font-mono">
                            RPT-{test.reportNumber}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-bold ml-2">Batch: {test.batchNumber}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded border text-[9px] uppercase tracking-wider ${priorityColor}`}>
                          {test.priority}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700">{test.parameterName}</span>
                        <span className="text-[10px] text-slate-400 font-bold font-mono">{test.dueSince}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-16 text-center">
                  <p className="text-xs text-slate-450 font-black">All incubator parameters updated!</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">No pending tests currently require attention.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
