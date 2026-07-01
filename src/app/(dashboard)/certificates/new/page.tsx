import { CertificateForm } from "../components/certificate-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOrganizations } from "@/app/actions/organization";
import { getTestReports } from "@/app/actions/report";

import { getAuthenticatedUser } from "@/lib/auth/tenant-access";
import { redirect } from "next/navigation";

export default async function NewCertificatePage() {
  let user;
  try {
    user = await getAuthenticatedUser();
  } catch (error) {
    redirect("/login");
  }

  const [orgResult, reportsResult] = await Promise.all([
    getOrganizations(),
    getTestReports()
  ]);
  const organizations = orgResult.success ? orgResult.data : [];
  const reports = reportsResult.success ? reportsResult.data : [];
  
  const currentUserId = user.id;

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/certificates">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Issue Certificate</h1>
          <p className="text-muted-foreground mt-1 text-sm">Generate a new BIS IS 14543 compliance certificate.</p>
        </div>
      </div>

      <CertificateForm 
        organizations={organizations || []} 
        reports={reports || []} 
        currentUserId={currentUserId} 
      />
    </div>
  );
}