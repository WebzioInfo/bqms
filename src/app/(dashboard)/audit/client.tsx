"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { Activity, Database, History, DatabaseBackup, PlusCircle, Trash2, Edit } from "lucide-react";

interface AuditClientProps {
  data: any[];
}

export function AuditClient({ data }: AuditClientProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATE": return <PlusCircle className="h-4 w-4 text-emerald-600" />;
      case "UPDATE": return <Edit className="h-4 w-4 text-blue-600" />;
      case "DELETE": return <Trash2 className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const columns: Column<any>[] = [
    {
      key: "action",
      header: "Action",
      cell: (log) => (
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
            log.action === "CREATE" ? "bg-emerald-100" :
            log.action === "UPDATE" ? "bg-blue-100" :
            log.action === "DELETE" ? "bg-red-100" : "bg-gray-100"
          }`}>
            {getActionIcon(log.action)}
          </div>
          <div>
            <span className="font-semibold block">{log.action}</span>
            <span className="text-xs text-muted-foreground block">{log.entityName}</span>
          </div>
        </div>
      )
    },
    {
      key: "timestamp",
      header: "Timestamp",
      cell: (log) => <span className="text-sm font-medium">{format(new Date(log.createdAt), "PP pp")}</span>
    },
    {
      key: "user",
      header: "User",
      cell: (log) => <span className="text-sm">{log.user?.name || log.user?.email || "System"}</span>
    },
    {
      key: "ipAddress",
      header: "IP Address",
      cell: (log) => <span className="text-sm text-muted-foreground font-mono">{log.ipAddress || "N/A"}</span>
    },
    {
      key: "actions",
      header: "Actions",
      cell: (log) => (
        <div className="flex justify-end">
          <Link href={`/audit/${log.id}`}>
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
        searchKey="entityName"
        searchPlaceholder="Search by entity name (e.g. User, Batch)..."
        emptyMessage="No audit logs recorded yet."
      />
    </div>
  );
}
