import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, Download, TrendingUp } from "lucide-react";
import { ExportCsvButton } from "./export-button";

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

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Organization Name",
      cell: (org) => <span className="font-medium">{org.name}</span>
    },
    {
      key: "type",
      header: "Entity Type",
      cell: (org) => <Badge variant="outline">{org.type}</Badge>
    },
    {
      key: "certificates",
      header: "Total Certificates",
      cell: (org) => <span>{org._count.certificates}</span>
    },
    {
      key: "batches",
      header: "Batches Tracked",
      cell: (org) => <span>{org._count.batches}</span>
    },
    {
      key: "inspections",
      header: "Inspections",
      cell: (org) => <span>{org._count.inspections}</span>
    },
    {
      key: "trustScore",
      header: "Trust Score",
      cell: (org) => (
        org.trustScore !== null ? (
          <span className={org.trustScore >= 80 ? "text-green-600 font-medium flex items-center gap-1" : "text-amber-600 font-medium flex items-center gap-1"}>
            {org.trustScore >= 80 && <TrendingUp className="h-3 w-3" />}
            {org.trustScore.toFixed(1)}
          </span>
        ) : "N/A"
      )
    }
  ];

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
          <DataTable 
            columns={columns} 
            data={organizations} 
            searchKey="name"
            searchPlaceholder="Search reports by organization..."
            emptyMessage="No reporting data found."
          />
        </CardContent>
      </Card>
    </div>
  );
}
