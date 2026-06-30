import { getApiProductById } from "@/app/actions/api-product";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, LineChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function ApiProductAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getApiProductById(id);
  
  if (!result.success || !result.data) {
    notFound();
  }

  const data: any = result.data;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href={`/api-products/${id}`}>
          <Button variant="ghost" size="icon" className="rounded-full shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{data.name} Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm">Performance and revenue metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <LineChart className="h-4 w-4" /> Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${(data.subscriptions?.length || 0) * (data.price || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Based on active subscriptions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
