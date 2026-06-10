import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { ExportCsvButton } from "./export-button";
import { ReportsClient } from "./client";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const userRole = session?.user?.role;
  // @ts-ignore
  const orgId = session?.user?.organizationId;

  const whereClause = userRole !== "SUPER_ADMIN" && orgId ? { id: orgId } : {};

  // For reports, we will load organizations and their aggregated certificate/batch counts
  const organizations = await prisma.organization.findMany({
    where: whereClause,
    include: {
      _count: {
        select: { certificates: true, batches: true, inspections: true }
      }
    },
    orderBy: { trustScore: "desc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1 text-sm">Aggregate system metrics and performance data.</p>
        </div>
        <ExportCsvButton data={organizations} />
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="shadow-sm border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Reporting Entities</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-muted">
        <CardHeader>
          <CardTitle>Organization Performance Report</CardTitle>
          <CardDescription>Metrics aggregated by organization entity.</CardDescription>
        </CardHeader>
        <CardContent>
          <ReportsClient data={organizations} />
        </CardContent>
      </Card>
    </div>
  );
}
