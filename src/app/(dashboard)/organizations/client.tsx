"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface OrganizationsClientProps {
  data: any[];
}

export function OrganizationsClient({ data }: OrganizationsClientProps) {
  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Name",
      cell: (org) => <span className="font-medium">{org.name}</span>
    },
    {
      key: "type",
      header: "Type",
      cell: (org) => <Badge variant="outline">{org.type}</Badge>
    },
    {
      key: "erp",
      header: "ERP Reference",
      cell: (org) => <span>{org.erpReferenceId || "N/A"}</span>
    },
    {
      key: "trustScore",
      header: "Trust Score",
      cell: (org) => (
        org.trustScore !== null ? (
          <span className={org.trustScore >= 80 ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
            {org.trustScore.toFixed(1)}
          </span>
        ) : "N/A"
      )
    },
    {
      key: "actions",
      header: "Actions",
      cell: (org) => (
        <div className="flex justify-end">
          <Link href={`/organizations/${org.id}`}>
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
      searchKey="name"
      searchPlaceholder="Search by organization name..."
      emptyMessage="No organizations found."
    />
  );
}
