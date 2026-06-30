import { getApiProducts } from "@/app/actions/api-product";
import { ApiProductsClient } from "./client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function ApiProductsPage() {
  const result = await getApiProducts();
  const products = result.success ? result.data : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Products</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage API monetization tiers, limits, and pricing.</p>
        </div>
        <Link href="/api-products/new">
          <Button className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Create Product
          </Button>
        </Link>
      </div>

      <ApiProductsClient data={products || []} />
    </div>
  );
}