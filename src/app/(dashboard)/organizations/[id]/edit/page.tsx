import { OrganizationForm } from "../../components/organization-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOrganizationById } from "@/app/actions/organization";
import { notFound } from "next/navigation";

export default async function EditOrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getOrganizationById(id);
  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href={`/organizations/${id}`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Organization</h1>
          <p className="text-muted-foreground mt-1 text-sm">Update company details and licensing information.</p>
        </div>
      </div>

      <OrganizationForm initialData={result.data} />
    </div>
  );
}