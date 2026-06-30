import { getApiProductById } from "@/app/actions/api-product";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function ApiProductUsagePage({ params }: { params: Promise<{ id: string }> }) {
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
          <h1 className="text-3xl font-bold tracking-tight">{result.data.name} Usage Metrics</h1>
          <p className="text-muted-foreground mt-1 text-sm">Daily API calls and rate limiting</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" /> Global Request Volume
          </CardTitle>
          <CardDescription>Mocked tracking data for V3 demo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-end gap-2 mt-4">
            {[40, 20, 50, 80, 60, 90, 70].map((val, i) => (
              <div 
                key={i} 
                className="bg-indigo-500/80 hover:bg-indigo-500 rounded-t w-full transition-all"
                style={{ height: `${val}%` }}
              ></div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2 px-2">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
