"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { Beaker, Plus } from "lucide-react";

export function WaterTestReportsClient({ reports, userRole }: { reports: any[], userRole: string }) {

  const statusColorMap: Record<string, string> = {
    PENDING: "secondary",
    SAMPLE_SENT: "default",
    UNDER_TESTING: "default",
    AWAITING_RESULT: "default",
    COMPLETED: "default",
    FAILED: "destructive",
    REJECTED: "destructive",
  };

  const columns: Column<any>[] = [
    { key: "reportNumber", header: "Report No.", cell: (r) => <span className="font-mono text-sm">{r.reportNumber}</span> },
    { key: "batch", header: "Batch", cell: (r) => r.batch ? <span className="font-medium text-primary">{r.batch.batchNumber}</span> : "N/A" },
    { key: "date", header: "Production Date", cell: (r) => <span suppressHydrationWarning>{format(new Date(r.productionDate), 'MMM dd, yyyy')}</span> },
    { key: "status", header: "Status", cell: (r) => <Badge variant={statusColorMap[r.status] as any}>{r.status}</Badge> },
    { key: "actions", header: "Actions", cell: (r) => <Link href={`/water-test-reports/${r.id}`}><Button variant="ghost" size="sm">Manage</Button></Link> },
  ];

  if (userRole === "SUPER_ADMIN" || userRole === "BIOFIX_ADMIN") {
    columns.splice(2, 0, { key: "company", header: "Organization", cell: (r) => r.company?.name || "N/A" });
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Beaker className="h-8 w-8 text-primary" />
            Water Test Reports
          </h1>
          <p className="text-muted-foreground mt-1">Manage laboratory water quality testing for production batches.</p>
        </div>
        
        {(userRole === "QC_USER" || userRole === "LAB_STAFF") && (
          <Link href="/water-test-reports/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Test Report
            </Button>
          </Link>
        )}
      </div>

      <Card className="shadow-sm border-muted">
        <CardContent className="p-0">
          <DataTable 
            columns={columns} 
            data={reports} 
            searchKey="reportNumber" 
            searchPlaceholder="Search by report number..." 
            emptyMessage="No water test reports found."
          />
        </CardContent>
      </Card>
    </div>
  );
}
