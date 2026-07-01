import { CertificateForm } from "../../components/certificate-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCertificateById } from "@/app/actions/certificate";
import { getOrganizations } from "@/app/actions/organization";
import { getTestReports } from "@/app/actions/report";
import { notFound } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/tenant-access";
import { redirect } from "next/navigation";

export default async function EditCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let user;
  try {
    user = await getAuthenticatedUser();
  } catch (error) {
    redirect("/login");
  }

  const [certResult, orgResult, reportsResult] = await Promise.all([
    getCertificateById(id),
    getOrganizations(),
    getTestReports()
  ]);

  if (!certResult.success || !certResult.data) {
    notFound();
  }

  const organizations = orgResult.success ? orgResult.data : [];
  const reports = reportsResult.success ? reportsResult.data : [];
  const currentUserId = user.id;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href={`/certificates/${id}`}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Certificate</h1>
          <p className="text-muted-foreground mt-1 text-sm">Update compliance certificate details.</p>
        </div>
      </div>

      <CertificateForm 
        initialData={certResult.data} 
        organizations={organizations || []} 
        reports={reports || []} 
        currentUserId={currentUserId} 
      />
    </div>
  );
}