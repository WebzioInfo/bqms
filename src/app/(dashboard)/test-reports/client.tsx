"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { FileText } from "lucide-react";

interface TestReportsClientProps {
  data: any[];
}

export function TestReportsClient({ data }: TestReportsClientProps) {
  const columns: Column<any>[] = [
    {
      key: "reportNumber",
      header: "Report No.",
      cell: (report) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <FileText className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <span className="font-semibold block">{report.reportNumber}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[150px] inline-block">Batch: {report.batchNumber || "Unknown"}</span>
          </div>
        </div>
      )
    },
    {
      key: "sampleTime",
      header: "Sample Date",
      cell: (report) => <span className="text-sm">{format(new Date(report.sampleTime), "PPP")}</span>
    },
    {
      key: "organization",
      header: "Organization",
      cell: (report) => <span className="text-sm font-medium">{report.organization?.name}</span>
    },
    {
      key: "status",
      header: "Status",
      cell: (report) => {
        const variants: Record<string, string> = {
          "DRAFT": "bg-gray-100 text-gray-800",
          "SUBMITTED": "bg-yellow-100 text-yellow-800",
          "REVIEWED": "bg-blue-100 text-blue-800",
          "APPROVED": "bg-green-100 text-green-800",
          "PUBLISHED": "bg-emerald-100 text-emerald-800",
          "REJECTED": "bg-red-100 text-red-800",
          "RETEST_REQUIRED": "bg-orange-100 text-orange-800",
        };
        return (
          <Badge variant="outline" className={variants[report.status] || ""}>
            {report.status.replace("_", " ")}
          </Badge>
        );
      }
    },
    {
      key: "actions",
      header: "Actions",
      cell: (report) => (
        <div className="flex justify-end">
          <Link href={`/test-reports/${report.id}`}>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 transition-colors">View Details</Button>
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <DataTable 
        columns={columns} 
        data={data} 
        searchKey="reportNumber"
        searchPlaceholder="Search by report number..."
        emptyMessage="No test reports found."
      />
    </div>
  );
}
