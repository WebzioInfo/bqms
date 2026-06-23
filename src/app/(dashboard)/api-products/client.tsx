"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Server } from "lucide-react";

interface ApiProductsClientProps {
  data: any[];
}

export function ApiProductsClient({ data }: ApiProductsClientProps) {
  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Product Name",
      cell: (product) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <Server className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <span className="font-semibold block">{product.name}</span>
            <span className="text-xs text-muted-foreground block truncate max-w-[200px]">{product.description || "No description"}</span>
          </div>
        </div>
      )
    },
    {
      key: "price",
      header: "Base Price",
      cell: (product) => <span className="font-medium">${product.basePrice.toFixed(2)}/mo</span>
    },
    {
      key: "limit",
      header: "Rate Limit",
      cell: (product) => <span className="text-sm">{product.requestLimit.toLocaleString()} req/day</span>
    },
    {
      key: "status",
      header: "Status",
      cell: (product) => (
        <Badge variant={product.isActive ? "default" : "secondary"} className={product.isActive ? "bg-green-100 text-green-800" : ""}>
          {product.isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
    {
      key: "actions",
      header: "Actions",
      cell: (product) => (
        <div className="flex justify-end">
          <Link href={`/api-products/${product.id}`}>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 transition-colors">View Details</Button>
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <DataTable 
        columns={columns} 
        data={data} 
        searchKey="name"
        searchPlaceholder="Search products by name..."
        emptyMessage="No API products configured."
      />
    </div>
  );
}