import { getCustomerById } from "@/app/actions/customer";
import { notFound } from "next/navigation";
import { CustomerDetailClient } from "./client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getCustomerById(id);
  
  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/customers">
            <Button variant="ghost" size="icon" className="rounded-full shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{result.data.name}</h1>
            <p className="text-muted-foreground mt-1 text-sm">Customer Details & Orders</p>
          </div>
        </div>
        
        <Link href={`/customers/${id}/edit`}>
          <Button variant="outline" className="shadow-sm">
            <Edit className="mr-2 h-4 w-4" /> Edit Customer
          </Button>
        </Link>
      </div>

      <CustomerDetailClient customer={result.data} />
    </div>
  );
}
