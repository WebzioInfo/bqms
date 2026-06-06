import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KeyRound, ShieldAlert, Code2, Copy } from "lucide-react";

export default async function ApiMarketplacePage() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const userRole = session?.user?.role;
  // @ts-ignore
  const orgId = session?.user?.organizationId;

  // We will map API usage/readiness to the organizations table.
  const whereClause = userRole !== "SUPER_ADMIN" && orgId ? { id: orgId } : {};

  const organizations = await prisma.organization.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" }
  });

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Organization Name",
      cell: (org) => <span className="font-medium">{org.name}</span>
    },
    {
      key: "apiStatus",
      header: "API Status",
      cell: (org) => (
        <Badge variant="outline" className={org.erpReferenceId ? "bg-green-500/10 text-green-700 border-green-500/20" : "bg-muted text-muted-foreground"}>
          {org.erpReferenceId ? "Active" : "Inactive"}
        </Badge>
      )
    },
    {
      key: "clientId",
      header: "Client ID",
      cell: (org) => <span className="font-mono text-xs text-muted-foreground">{org.id.split('-')[0]}***</span>
    },
    {
      key: "actions",
      header: "Actions",
      cell: (org) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" className="text-primary" disabled={!org.erpReferenceId}>
            <Copy className="mr-2 h-3 w-3" /> Copy Keys
          </Button>
          <Button variant="outline" size="sm" className="shadow-sm">
            {org.erpReferenceId ? "Revoke" : "Generate Keys"}
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Marketplace</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage API keys and developer access for integrations.</p>
        </div>
        <Button className="shadow-sm">
          <Code2 className="mr-2 h-4 w-4" />
          API Documentation
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="shadow-sm border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active API Tokens</CardTitle>
            <KeyRound className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.filter(o => o.erpReferenceId).length}</div>
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
          <CardTitle>API Access Tokens</CardTitle>
          <CardDescription>Manage programmatic access credentials for the BQMS platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={organizations} 
            searchKey="name"
            searchPlaceholder="Search by organization name..."
            emptyMessage="No API configurations found."
          />
        </CardContent>
      </Card>
    </div>
  );
}
