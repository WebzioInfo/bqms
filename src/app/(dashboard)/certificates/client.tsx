"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CertificatesClientProps {
  data: any[];
}

export function CertificatesClient({ data }: CertificatesClientProps) {
  const columns: Column<any>[] = [
    {
      key: "certificateNo",
      header: "Certificate No",
      cell: (cert) => <span className="font-medium text-primary">{cert.certificateNo}</span>
    },
    {
      key: "organization",
      header: "Organization",
      cell: (cert) => <span>{cert.organization.name}</span>
    },
    {
      key: "batch",
      header: "Batch",
      cell: (cert) => <span>{cert.batch?.batchNumber || "N/A"}</span>
    },
    {
      key: "issueDate",
      header: "Issue Date",
      cell: (cert) => <span>{new Date(cert.issueDate).toLocaleDateString()}</span>
    },
    {
      key: "status",
      header: "Status",
      cell: (cert) => (
        <Badge variant={cert.status === "ACTIVE" ? "default" : "secondary"}>
          {cert.status}
        </Badge>
      )
    },
    {
      key: "actions",
      header: "Actions",
      cell: (cert) => (
        <div className="flex justify-end gap-2">
          <Link href={`/certificates/${cert.id}`}>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">View</Button>
          </Link>
          {cert.pdfUrl && (
            <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="shadow-sm">PDF</Button>
            </a>
          )}
        </div>
      )
    }
  ];

  return (
    <DataTable 
      columns={columns} 
      data={data} 
      searchKey="certificateNo"
      searchPlaceholder="Search by certificate number..."
      emptyMessage="No certificates found."
    />
  );
}
