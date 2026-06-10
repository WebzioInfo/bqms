"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";

interface AuditLogsClientProps {
  data: any[];
}

export function AuditLogsClient({ data }: AuditLogsClientProps) {
  const columns: Column<any>[] = [
    {
      key: "action",
      header: "Action",
      cell: (log) => (
        <Badge variant="outline" className="font-mono text-xs">
          {log.action}
        </Badge>
      )
    },
    {
      key: "organization",
      header: "Organization",
      cell: (log) => <span className="font-medium">{log.organization}</span>
    },
    {
      key: "entity",
      header: "Entity Reference",
      cell: (log) => <span className="text-muted-foreground text-sm">{log.entity}</span>
    },
    {
      key: "user",
      header: "Performed By",
      cell: (log) => <span>{log.user}</span>
    },
    {
      key: "timestamp",
      header: "Timestamp",
      cell: (log) => (
        <div className="flex flex-col text-sm text-muted-foreground">
          <span>{new Date(log.timestamp).toLocaleDateString()}</span>
          <span className="text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
        </div>
      )
    }
  ];

  return (
    <DataTable 
      columns={columns} 
      data={data} 
      searchKey="action"
      searchPlaceholder="Search by action type..."
      emptyMessage="No audit logs found."
    />
  );
}
