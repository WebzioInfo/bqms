import { getApiProductById } from "@/app/actions/api-product";
import { notFound } from "next/navigation";
import { ApiProductDetailClient } from "./client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";

export default async function ApiProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getApiProductById(id);
  
  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/api-products">
            <Button variant="ghost" size="icon" className="rounded-full shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{result.data.name}</h1>
            <p className="text-muted-foreground mt-1 text-sm">API Product Details & Subscribers</p>
          </div>
        </div>
        
        <Link href={`/api-products/${id}/edit`}>
          <Button variant="outline" className="shadow-sm">
            <Edit className="mr-2 h-4 w-4" /> Edit Product
          </Button>
        </Link>
      </div>

      <ApiProductDetailClient product={result.data} />
    </div>
  );
}
