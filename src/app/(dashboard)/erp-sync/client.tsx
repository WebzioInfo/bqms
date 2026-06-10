"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";
import { ForceSyncButton } from "./sync-buttons";

interface ERPSyncClientProps {
  data: any[];
}

export function ERPSyncClient({ data }: ERPSyncClientProps) {
  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Organization Name",
      cell: (org) => <span className="font-medium">{org.name}</span>
    },
    {
      key: "erpReferenceId",
      header: "ERP Reference ID",
      cell: (org) => <span className="font-mono text-xs">{org.erpReferenceId}</span>
    },
    {
      key: "lastSync",
      header: "Last Sync",
      cell: (org) => (
        <div className="flex items-center gap-2">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span>{new Date(org.updatedAt).toLocaleDateString()} {new Date(org.updatedAt).toLocaleTimeString()}</span>
        </div>
      )
    },
    {
      key: "status",
      header: "Sync Status",
      cell: (org) => (
        <Badge variant="default" className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20 flex items-center gap-1 w-fit">
          <CheckCircle2 className="h-3 w-3" /> In Sync
        </Badge>
      )
    },
    {
      key: "actions",
      header: "Actions",
      cell: (org) => (
        <div className="flex justify-end">
          <ForceSyncButton orgId={org.id} />
        </div>
      )
    }
  ];

  return (
    <DataTable 
      columns={columns} 
      data={data} 
      searchKey="name"
      searchPlaceholder="Search by organization name..."
      emptyMessage="No ERP integrations found."
    />
  );
}
