import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KeyRound, ShieldAlert, Code2 } from "lucide-react";
import { ApiMarketplaceClient } from "./client";

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
          <ApiMarketplaceClient data={organizations} />
        </CardContent>
      </Card>
    </div>
  );
}
