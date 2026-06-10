"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface BatchesClientProps {
  data: any[];
}

export function BatchesClient({ data }: BatchesClientProps) {
  const columns: Column<any>[] = [
    {
      key: "batchNumber",
      header: "Batch Number",
      cell: (batch) => <span className="font-mono">{batch.batchNumber}</span>
    },
    {
      key: "organization",
      header: "Organization",
      cell: (batch) => <span>{batch.organization.name}</span>
    },
    {
      key: "productionDate",
      header: "Production Date",
      cell: (batch) => <span>{new Date(batch.productionDate).toLocaleDateString()}</span>
    },
    {
      key: "status",
      header: "Status",
      cell: (batch) => (
        <Badge variant={
          batch.verificationStatus === "VERIFIED" ? "default" :
          batch.verificationStatus === "REJECTED" ? "destructive" :
          "secondary"
        }>
          {batch.verificationStatus}
        </Badge>
      )
    },
    {
      key: "actions",
      header: "Actions",
      cell: (batch) => (
        <div className="flex items-center gap-2 justify-end">
          <Link href={`/batches/${batch.id}`}>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">View Details</Button>
          </Link>
        </div>
      )
    }
  ];

  return (
    <DataTable 
      columns={columns} 
      data={data} 
      searchKey="batchNumber"
      searchPlaceholder="Search by batch number..."
      emptyMessage="No batches found."
    />
  );
}
