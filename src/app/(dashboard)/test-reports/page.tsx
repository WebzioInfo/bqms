import { getTestReports } from "@/app/actions/report";
import { TestReportsClient } from "./client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function TestReportsPage() {
  const result = await getTestReports();
  const reports = result.success ? result.data : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Reports</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage quality control test reports with manual batch references.</p>
        </div>
        <Link href="/test-reports/new">
          <Button className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> New Test Report
          </Button>
        </Link>
      </div>

      <TestReportsClient data={reports || []} />
    </div>
  );
}
