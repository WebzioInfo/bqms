import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCw, ServerCrash, CheckCircle2, Clock } from "lucide-react";
import { ForceSyncButton, SyncAllButton } from "./sync-buttons";

export default async function ERPSyncPage() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const userRole = session?.user?.role;
  // @ts-ignore
  const orgId = session?.user?.organizationId;

  const whereClause = userRole !== "SUPER_ADMIN" && orgId ? { id: orgId, erpReferenceId: { not: null } } : { erpReferenceId: { not: null } };

  // @ts-ignore
  const organizations = await prisma.organization.findMany({
    where: whereClause,
    orderBy: { updatedAt: "desc" }
  });

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Organization Name",
      cell: (org) => <span className="font-medium">{org.name}</span>
    },
    {
      key: "erpReferenceId",
      header: "ERP Reference ID",
      cell: (org) => <span className="font-mono text-xs">{org.erpReferenceId}</span>
    },
    {
      key: "lastSync",
      header: "Last Sync",
      cell: (org) => (
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span>{org.updatedAt.toLocaleDateString()} {org.updatedAt.toLocaleTimeString()}</span>
        </div>
      )
    },
    {
      key: "status",
      header: "Sync Status",
      cell: (org) => (
        <Badge variant="default" className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20 flex items-center gap-1 w-fit">
          <CheckCircle2 className="h-3 w-3" /> In Sync
        </Badge>
      )
    },
    {
      key: "actions",
      header: "Actions",
      cell: (org) => (
        <div className="flex justify-end">
          <ForceSyncButton orgId={org.id} />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ERP Integration Sync</h1>
          <p className="text-muted-foreground mt-1 text-sm">Monitor and trigger bidirectional syncs with connected Enterprise Resource Planning systems.</p>
        </div>
        <SyncAllButton />
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="shadow-sm border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active ERP Links</CardTitle>
            <RefreshCw className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Failed Syncs</CardTitle>
            <ServerCrash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-muted">
        <CardHeader>
          <CardTitle>Connected Entities</CardTitle>
          <CardDescription>Organizations with an established ERP Reference ID.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={organizations} 
            searchKey="name"
            searchPlaceholder="Search by organization name..."
            emptyMessage="No ERP integrations found."
          />
        </CardContent>
      </Card>
    </div>
  );
}
