import { CustomerForm } from "../components/customer-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOrganizations } from "@/app/actions/organization";
import { getAuthenticatedUser } from "@/lib/auth/tenant-access";
import { redirect } from "next/navigation";

export default async function NewCustomerPage() {
  let user;
  try {
    user = await getAuthenticatedUser();
  } catch (error) {
    redirect("/login");
  }

  const [orgResult] = await Promise.all([
    getOrganizations()
  ]);
  const organizations = orgResult.success ? orgResult.data : [];
  
  const currentUserId = user.id;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/customers">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Customer</h1>
          <p className="text-muted-foreground mt-1 text-sm">Register a new distributor or client.</p>
        </div>
      </div>

      <CustomerForm organizations={organizations || []} currentUserId={currentUserId} />
    </div>
  );
}
