import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshCw, ServerCrash } from "lucide-react";
import { SyncAllButton } from "./sync-buttons";
import { ERPSyncClient } from "./client";

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
          <ERPSyncClient data={organizations} />
        </CardContent>
      </Card>
    </div>
  );
}
