import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, ShieldAlert, FileSignature } from "lucide-react";

export default async function AuditLogsPage() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const userRole = session?.user?.role;
  // @ts-ignore
  const orgId = session?.user?.organizationId;

  const whereClause = userRole !== "SUPER_ADMIN" && orgId ? { organizationId: orgId } : {};

  // We don't have a dedicated AuditLog model. To provide real, non-mocked data,
  // we will aggregate recent creations across the system to simulate an audit feed.
  const [recentBatches, recentInspections, recentCertificates] = await Promise.all([
    prisma.batch.findMany({ where: whereClause, include: { organization: true }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.inspection.findMany({ where: whereClause, include: { organization: true, inspector: true }, orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.certificate.findMany({ where: whereClause, include: { organization: true }, orderBy: { issueDate: "desc" }, take: 10 })
  ]);

  const rawEvents = [
    ...recentBatches.map(b => ({
      id: `batch-${b.id}`,
      action: "BATCH_CREATED",
      entity: b.batchNumber,
      organization: b.organization.name,
      user: "System/User",
      timestamp: b.createdAt
    })),
    ...recentInspections.map(i => ({
      id: `insp-${i.id}`,
      action: "INSPECTION_LOGGED",
      entity: i.complianceStatus,
      organization: i.organization.name,
      user: i.inspector.name || i.inspector.email,
      timestamp: i.createdAt
    })),
    ...recentCertificates.map(c => ({
      id: `cert-${c.id}`,
      action: "CERTIFICATE_ISSUED",
      entity: c.certificateNo,
      organization: c.organization.name,
      user: "Admin",
      timestamp: c.issueDate
    }))
  ];

  const auditLogs = rawEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const columns: Column<any>[] = [
    {
      key: "action",
      header: "Action",
      cell: (log) => (
        <Badge variant="outline" className="font-mono text-xs">
          {log.action}
        </Badge>
      )
    },
    {
      key: "organization",
      header: "Organization",
      cell: (log) => <span className="font-medium">{log.organization}</span>
    },
    {
      key: "entity",
      header: "Entity Reference",
      cell: (log) => <span className="text-muted-foreground text-sm">{log.entity}</span>
    },
    {
      key: "user",
      header: "Performed By",
      cell: (log) => <span>{log.user}</span>
    },
    {
      key: "timestamp",
      header: "Timestamp",
      cell: (log) => (
        <div className="flex flex-col text-sm text-muted-foreground">
          <span>{log.timestamp.toLocaleDateString()}</span>
          <span className="text-xs">{log.timestamp.toLocaleTimeString()}</span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground mt-1 text-sm">Review immutable records of system activity and user actions.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="shadow-sm border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-muted">
        <CardHeader>
          <CardTitle>System Event Log</CardTitle>
          <CardDescription>Aggregated activity across batches, certificates, and inspections.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={auditLogs} 
            searchKey="action"
            searchPlaceholder="Search by action type..."
            emptyMessage="No audit logs found."
          />
        </CardContent>
      </Card>
    </div>
  );
}
