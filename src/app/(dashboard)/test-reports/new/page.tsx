import { ReportForm } from "../components/report-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOrganizations } from "@/app/actions/organization";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function NewTestReportPage() {
  const [orgResult, session] = await Promise.all([
    getOrganizations(),
    getServerSession(authOptions)
  ]);
  const organizations = orgResult.success ? orgResult.data : [];
  
  const currentUserId = (session?.user as any)?.id || "unknown";

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/test-reports">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Test Report</h1>
          <p className="text-muted-foreground mt-1 text-sm">Create a new quality control test report.</p>
        </div>
      </div>

      <ReportForm organizations={organizations || []} currentUserId={currentUserId} />
    </div>
  );
}
