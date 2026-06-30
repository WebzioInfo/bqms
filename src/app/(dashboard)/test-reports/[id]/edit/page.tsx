import { ReportForm } from "../../components/report-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTestReportById } from "@/app/actions/report";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function EditTestReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [reportResult, session] = await Promise.all([
    getTestReportById(id),
    getServerSession(authOptions)
  ]);

  if (!reportResult.success || !reportResult.data) {
    if (reportResult.error === "Not found") {
      notFound();
    }
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-600">Failed to load report for editing</h2>
          <p className="text-slate-600 max-w-md mx-auto">{reportResult.error}</p>
          <Link href="/test-reports">
            <Button variant="outline" className="mt-4">Back to Reports</Button>
          </Link>
        </div>
      </div>
    );
  }

  const userOrgId = reportResult.data.organizationId;

  return (
    <div className="space-y-6 max-w-[1600px] w-full mx-auto px-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href={`/test-reports/${id}`}>
          <Button variant="ghost" size="icon" className="rounded-full border shadow-sm">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Test Report</h1>
          <p className="text-muted-foreground mt-1 text-sm">Update quality control report details.</p>
        </div>
      </div>

      <ReportForm 
        initialData={reportResult.data} 
        organizationId={userOrgId}
      />
    </div>
  );
}
