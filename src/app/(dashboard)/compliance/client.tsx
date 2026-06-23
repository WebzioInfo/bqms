"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { ShieldAlert } from "lucide-react";

interface ComplianceClientProps {
  data: any[];
}

export function ComplianceClient({ data }: ComplianceClientProps) {
  const columns: Column<any>[] = [
    {
      key: "title",
      header: "Issue / Finding",
      cell: (record) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
            <ShieldAlert className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <span className="font-semibold block truncate max-w-[200px]">{record.title}</span>
            <span className="text-xs text-muted-foreground block">{record.organization?.name}</span>
          </div>
        </div>
      )
    },
    {
      key: "type",
      header: "Type",
      cell: (record) => {
        const typeMap: Record<string, string> = {
          "AUDIT_FINDING": "Audit Finding",
          "NCR": "Non-Conformance (NCR)",
          "CUSTOMER_COMPLAINT": "Complaint",
          "CAPA": "Corrective Action (CAPA)",
        };
        return <span className="text-sm font-medium">{typeMap[record.type] || record.type}</span>;
      }
    },
    {
      key: "dueDate",
      header: "Due Date",
      cell: (record) => (
        <span className="text-sm">
          {record.dueDate ? format(new Date(record.dueDate), "PP") : "No deadline"}
        </span>
      )
    },
    {
      key: "status",
      header: "Status",
      cell: (record) => {
        const variants: Record<string, string> = {
          "OPEN": "bg-red-100 text-red-800",
          "IN_PROGRESS": "bg-yellow-100 text-yellow-800",
          "IN_REVIEW": "bg-blue-100 text-blue-800",
          "CLOSED": "bg-green-100 text-green-800",
        };
        return (
          <Badge variant="outline" className={variants[record.status] || ""}>
            {record.status.replace("_", " ")}
          </Badge>
        );
      }
    },
    {
      key: "actions",
      header: "Actions",
      cell: (record) => (
        <div className="flex justify-end">
          <Link href={`/compliance/${record.id}`}>
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
        searchKey="title"
        searchPlaceholder="Search findings by title..."
        emptyMessage="No compliance records found."
      />
    </div>
  );
}
