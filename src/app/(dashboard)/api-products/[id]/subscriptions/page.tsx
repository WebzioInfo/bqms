import { getApiProductById } from "@/app/actions/api-product";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ApiProductSubscriptionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getApiProductById(id);
  
  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href={`/api-products/${id}`}>
          <Button variant="ghost" size="icon" className="rounded-full shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{result.data.name} Subscriptions</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage organizations subscribed to this plan</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" /> Subscriber List
          </CardTitle>
          <CardDescription>All active and inactive subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          {(result.data as any).subscriptions && (result.data as any).subscriptions.length > 0 ? (
            <div className="space-y-3">
              {(result.data as any).subscriptions.map((sub: any) => (
                <div key={sub.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">{sub.organization?.name || "Unknown Org"}</p>
                    <p className="text-xs text-muted-foreground">ID: {sub.id}</p>
                  </div>
                  <Badge variant={sub.status === "ACTIVE" ? "default" : "secondary"}>
                    {sub.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground border rounded-lg bg-muted/10">
              No subscriptions found for this product.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
