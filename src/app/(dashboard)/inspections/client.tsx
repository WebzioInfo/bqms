"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface InspectionsClientProps {
  data: any[];
}

export function InspectionsClient({ data }: InspectionsClientProps) {
  const columns: Column<any>[] = [
    {
      key: "organization",
      header: "Organization",
      cell: (insp) => <span className="font-medium">{insp.organization.name}</span>
    },
    {
      key: "inspector",
      header: "Inspector",
      cell: (insp) => <span>{insp.inspector.name || insp.inspector.email}</span>
    },
    {
      key: "date",
      header: "Date",
      cell: (insp) => <span>{new Date(insp.inspectionDate).toLocaleDateString()}</span>
    },
    {
      key: "status",
      header: "Status",
      cell: (insp) => (
        <Badge variant={
          insp.complianceStatus === "PASS" ? "default" :
          insp.complianceStatus === "FAIL" ? "destructive" :
          "secondary"
        }>
          {insp.complianceStatus}
        </Badge>
      )
    },
    {
      key: "actions",
      header: "Actions",
      cell: (insp) => (
        <div className="flex justify-end gap-2">
          <Link href={`/inspections/${insp.id}`}>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">View Details</Button>
          </Link>
        </div>
      )
    }
  ];

  return (
    <DataTable 
      columns={columns} 
      data={data} 
      searchKey="organization.name"
      searchPlaceholder="Search inspections..."
      emptyMessage="No inspections found."
    />
  );
}
