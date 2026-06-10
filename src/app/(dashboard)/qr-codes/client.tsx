"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface QRCodesClientProps {
  data: any[];
}

export function QRCodesClient({ data }: QRCodesClientProps) {
  const columns: Column<any>[] = [
    {
      key: "code",
      header: "Code",
      cell: (qr) => <span className="font-mono">{qr.code}</span>
    },
    {
      key: "organization",
      header: "Organization",
      cell: (qr) => <span>{qr.organization?.name || "N/A"}</span>
    },
    {
      key: "batch",
      header: "Batch",
      cell: (qr) => <span>{qr.batch?.batchNumber || "N/A"}</span>
    },
    {
      key: "status",
      header: "Status",
      cell: (qr) => (
        <Badge variant={qr.status === "ACTIVE" ? "default" : "destructive"}>
          {qr.status}
        </Badge>
      )
    },
    {
      key: "scans",
      header: "Total Scans",
      cell: (qr) => <span>{qr._count?.scans || 0}</span>
    },
    {
      key: "actions",
      header: "Actions",
      cell: (qr) => (
        <div className="flex justify-end gap-2">
          <Link href={`/qr-codes/${qr.id}`}>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">Analytics</Button>
          </Link>
        </div>
      )
    }
  ];

  return (
    <DataTable 
      columns={columns} 
      data={data} 
      searchKey="code"
      searchPlaceholder="Search by QR code..."
      emptyMessage="No QR codes found."
    />
  );
}
