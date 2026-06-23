import { ApiProductForm } from "../components/api-product-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function NewApiProductPage() {
  const session = await getServerSession(authOptions);
  const currentUserId = (session?.user as any)?.id || "unknown";

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/api-products">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create API Product</h1>
          <p className="text-muted-foreground mt-1 text-sm">Define a new monetization tier for BQMS API access.</p>
        </div>
      </div>

      <ApiProductForm currentUserId={currentUserId} />
    </div>
  );
}
