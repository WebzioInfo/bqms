import { ApiProductForm } from "../components/api-product-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAuthenticatedUser } from "@/lib/auth/tenant-access";
import { redirect } from "next/navigation";

export default async function NewApiProductPage() {
  let user;
  try {
    user = await getAuthenticatedUser();
  } catch (error) {
    redirect("/login");
  }
  const currentUserId = user.id;

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
