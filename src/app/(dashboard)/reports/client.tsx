"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface ReportsClientProps {
  data: any[];
}

export function ReportsClient({ data }: ReportsClientProps) {
  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Organization Name",
      cell: (org) => <span className="font-medium">{org.name}</span>
    },
    {
      key: "type",
      header: "Entity Type",
      cell: (org) => <Badge variant="outline">{org.type}</Badge>
    },
    {
      key: "certificates",
      header: "Total Certificates",
      cell: (org) => <span>{org._count.certificates}</span>
    },
    {
      key: "batches",
      header: "Batches Tracked",
      cell: (org) => <span>{org._count.batches}</span>
    },
    {
      key: "inspections",
      header: "Inspections",
      cell: (org) => <span>{org._count.inspections}</span>
    },
    {
      key: "trustScore",
      header: "Trust Score",
      cell: (org) => (
        org.trustScore !== null ? (
          <span className={org.trustScore >= 80 ? "text-green-600 font-medium flex items-center gap-1" : "text-amber-600 font-medium flex items-center gap-1"}>
            {org.trustScore >= 80 && <TrendingUp className="h-3 w-3" />}
            {org.trustScore.toFixed(1)}
          </span>
        ) : "N/A"
      )
    }
  ];

  return (
    <DataTable 
      columns={columns} 
      data={data} 
      searchKey="name"
      searchPlaceholder="Search reports by organization..."
      emptyMessage="No reporting data found."
    />
  );
}
