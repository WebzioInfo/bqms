"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface ApiMarketplaceClientProps {
  data: any[];
}

export function ApiMarketplaceClient({ data }: ApiMarketplaceClientProps) {
  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Organization Name",
      cell: (org) => <span className="font-medium">{org.name}</span>
    },
    {
      key: "apiStatus",
      header: "API Status",
      cell: (org) => (
        <Badge variant="outline" className={org.erpReferenceId ? "bg-green-500/10 text-green-700 border-green-500/20" : "bg-muted text-muted-foreground"}>
          {org.erpReferenceId ? "Active" : "Inactive"}
        </Badge>
      )
    },
    {
      key: "clientId",
      header: "Client ID",
      cell: (org) => <span className="font-mono text-xs text-muted-foreground">{org.id.split('-')[0]}***</span>
    },
    {
      key: "actions",
      header: "Actions",
      cell: (org) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" className="text-primary" disabled={!org.erpReferenceId}>
            <Copy className="mr-2 h-3 w-3" /> Copy Keys
          </Button>
          <Button variant="outline" size="sm" className="shadow-sm">
            {org.erpReferenceId ? "Revoke" : "Generate Keys"}
          </Button>
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
      emptyMessage="No API configurations found."
    />
  );
}
