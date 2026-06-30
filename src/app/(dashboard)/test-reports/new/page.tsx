import { ReportForm } from "../components/report-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getOrganizations } from "@/app/actions/organization";

export default async function NewTestReportPage() {
  const [orgResult, session] = await Promise.all([
    getOrganizations(),
    getServerSession(authOptions)
  ]);
  const organizations = orgResult.success && orgResult.data ? orgResult.data : [];
  const userOrgId = (session?.user as any)?.organizationId || (organizations?.[0]?.id || "");

  return (
    <div className="space-y-6 max-w-[1600px] w-full mx-auto px-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/test-reports">
          <Button variant="ghost" size="icon" className="rounded-full border shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Water Test Report</h1>
          <p className="text-muted-foreground mt-1 text-sm">Create a new quality control test report based on the laboratory worksheet.</p>
        </div>
      </div>

      <ReportForm 
        organizationId={userOrgId}
      />
    </div>
  );
}
