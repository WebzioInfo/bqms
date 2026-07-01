import { CustomerForm } from "../../components/customer-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCustomerById } from "@/app/actions/customer";
import { getOrganizations } from "@/app/actions/organization";
import { notFound } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/tenant-access";
import { redirect } from "next/navigation";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let user;
  try {
    user = await getAuthenticatedUser();
  } catch (error) {
    redirect("/login");
  }

  const [customerResult, orgResult] = await Promise.all([
    getCustomerById(id),
    getOrganizations()
  ]);

  if (!customerResult.success || !customerResult.data) {
    notFound();
  }

  const organizations = orgResult.success ? orgResult.data : [];
  const currentUserId = user.id;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href={`/customers/${id}`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Customer</h1>
          <p className="text-muted-foreground mt-1 text-sm">Update contact info or account status.</p>
        </div>
      </div>

      <CustomerForm initialData={customerResult.data} organizations={organizations || []} currentUserId={currentUserId} />
    </div>
  );
}
