"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { Award } from "lucide-react";

interface CertificatesClientProps {
  data: any[];
}

export function CertificatesClient({ data }: CertificatesClientProps) {
  const columns: Column<any>[] = [
    {
      key: "certificateNumber",
      header: "Certificate No.",
      cell: (cert) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Award className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <span className="font-semibold block">{cert.certificateNumber}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[150px] inline-block">Batch: {cert.batchNumber || "Unknown"}</span>
          </div>
        </div>
      )
    },
    {
      key: "issueDate",
      header: "Issue Date",
      cell: (cert) => <span className="text-sm">{format(new Date(cert.issueDate), "PPP")}</span>
    },
    {
      key: "organization",
      header: "Organization",
      cell: (cert) => <span className="text-sm font-medium">{cert.organization?.name}</span>
    },
    {
      key: "status",
      header: "Status",
      cell: (cert) => {
        const variants: Record<string, string> = {
          "DRAFT": "bg-gray-100 text-gray-800",
          "ISSUED": "bg-green-100 text-green-800",
          "REVOKED": "bg-red-100 text-red-800",
          "EXPIRED": "bg-yellow-100 text-yellow-800",
        };
        return (
          <Badge variant="outline" className={variants[cert.status] || ""}>
            {cert.status}
          </Badge>
        );
      }
    },
    {
      key: "actions",
      header: "Actions",
      cell: (cert) => (
        <div className="flex justify-end">
          <Link href={`/certificates/${cert.id}`}>
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
        searchKey="certificateNumber"
        searchPlaceholder="Search by certificate number..."
        emptyMessage="No certificates issued yet."
      />
    </div>
  );
}
