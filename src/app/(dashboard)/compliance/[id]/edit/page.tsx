import { ComplianceForm } from "../../components/compliance-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getComplianceRecordById } from "@/app/actions/compliance";
import { getOrganizations } from "@/app/actions/organization";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function EditComplianceRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [recordResult, orgResult, session] = await Promise.all([
    getComplianceRecordById(id),
    getOrganizations(),
    getServerSession(authOptions)
  ]);

  if (!recordResult.success || !recordResult.data) {
    notFound();
  }

  const organizations = orgResult.success ? orgResult.data : [];
  const currentUserId = (session?.user as any)?.id || "unknown";

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href={`/compliance/${id}`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Compliance Record</h1>
          <p className="text-muted-foreground mt-1 text-sm">Update status or document CAPA resolution.</p>
        </div>
      </div>

      <ComplianceForm initialData={recordResult.data} organizations={organizations || []} currentUserId={currentUserId} />
    </div>
  );
}
