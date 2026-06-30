import { getTestReportById } from "@/app/actions/report";
import { notFound } from "next/navigation";
import { ReportDetailClient } from "./client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";

export default async function TestReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getTestReportById(id);
  
  if (!result.success || !result.data) {
    if (result.error === "Not found") {
      notFound();
    }
    // If it's a database connection error, show a proper error message instead of 404
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-600">Failed to load report</h2>
          <p className="text-slate-600 max-w-md mx-auto">{result.error}</p>
          <Link href="/test-reports">
            <Button variant="outline" className="mt-4">Back to Reports</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/test-reports">
            <Button variant="ghost" size="icon" className="rounded-full shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Report: {result.data.reportNumber}</h1>
            <p className="text-muted-foreground mt-1 text-sm">Quality Control Report Details</p>
          </div>
        </div>
        
        <Link href={`/test-reports/${id}/edit`}>
          <Button variant="outline" className="shadow-sm">
            <Edit className="mr-2 h-4 w-4" /> Edit Report
          </Button>
        </Link>
      </div>

      <ReportDetailClient report={result.data} />
    </div>
  );
}
