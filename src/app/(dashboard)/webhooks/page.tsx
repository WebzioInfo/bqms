import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Webhook, Plus } from "lucide-react";
import prisma from "@/lib/prisma";

export default async function WebhooksPage() {
  const webhooks = await prisma.webhookSubscription.findMany({
    include: { organization: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage outbound webhook subscriptions for real-time event notifications.</p>
        </div>
        <Button className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Endpoint
        </Button>
      </div>

      <Card className="shadow-sm border-muted">
        <CardHeader>
          <CardTitle>Endpoints</CardTitle>
          <CardDescription>Configured webhook destinations.</CardDescription>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/20 border-dashed">
              <Webhook className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
              <h3 className="font-semibold text-lg">No webhooks configured</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1">Subscribe to BQMS events like Batch Created, QC Failed, or Stock Low to integrate with your systems.</p>
              <Button className="mt-4" variant="outline">Create Webhook</Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {webhooks.map(hook => (
                <li key={hook.id} className="p-4 border rounded-md flex justify-between items-center">
                  <div>
                    <div className="font-medium">{hook.url}</div>
                    <div className="text-xs text-muted-foreground mt-1">Events: {hook.events.join(", ")}</div>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
