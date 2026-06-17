"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, KeyRound, Globe, Activity } from "lucide-react";

interface ApiMarketplaceClientProps {
  data: any[];
}

export function ApiMarketplaceClient({ data }: ApiMarketplaceClientProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Credential Name",
      cell: (cred) => (
        <div>
          <div className="font-medium">{cred.name}</div>
          <div className="text-xs text-muted-foreground">{cred.organization?.name}</div>
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      cell: (cred) => (
        <Badge variant={cred.isActive ? "default" : "secondary"}>
          {cred.isActive ? "Active" : "Revoked"}
        </Badge>
      )
    },
    {
      key: "apiKey",
      header: "API Key",
      cell: (cred) => (
        <div className="flex items-center gap-2">
          <code className="text-xs bg-muted p-1 rounded font-mono">{cred.apiKey.substring(0, 10)}...</code>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(cred.apiKey)}>
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      )
    },
    {
      key: "usage",
      header: "Recent Usage",
      cell: (cred) => {
        const totalRequests = cred.usageLogs?.length || 0;
        const failedRequests = cred.usageLogs?.filter((l: any) => l.statusCode >= 400).length || 0;
        return (
          <div className="text-xs">
            <div><span className="font-medium">{totalRequests}</span> reqs</div>
            {failedRequests > 0 && <div className="text-destructive">{failedRequests} failed</div>}
          </div>
        );
      }
    },
    {
      key: "lastUsed",
      header: "Last Used",
      cell: (cred) => <span className="text-xs">{cred.lastUsedAt ? new Date(cred.lastUsedAt).toLocaleDateString() : "Never"}</span>
    },
    {
      key: "actions",
      header: "Actions",
      cell: (cred) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" className="shadow-sm">
            Manage
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Button>
          <KeyRound className="mr-2 h-4 w-4" />
          Generate New Key
        </Button>
      </div>
      <DataTable 
        columns={columns} 
        data={data} 
        searchKey="name"
        searchPlaceholder="Search credentials..."
        emptyMessage="No API credentials generated yet."
      />
    </div>
  );
}
