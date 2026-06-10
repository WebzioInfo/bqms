import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KeyRound, ShieldAlert, Code2 } from "lucide-react";

export default async function ApiClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const org = await prisma.organization.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!org) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Configuration</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage API settings for {org.name}.</p>
        </div>
        <Badge variant={org.erpReferenceId ? "default" : "secondary"}>
          {org.erpReferenceId ? "API Active" : "No Active Tokens"}
        </Badge>
      </div>

      <Card className="shadow-sm border-muted">
        <CardHeader>
          <CardTitle>Integration Details</CardTitle>
          <CardDescription>Details of the API connection for this organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p><strong>Organization:</strong> {org.name}</p>
            <p><strong>ERP Reference ID:</strong> {org.erpReferenceId || "Not Configured"}</p>
            <p><strong>Status:</strong> {org.erpReferenceId ? "Connected" : "Disconnected"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
