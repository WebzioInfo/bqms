"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { Building2 } from "lucide-react";

interface OrganizationsClientProps {
  data: any[];
}

export function OrganizationsClient({ data }: OrganizationsClientProps) {
  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Organization Name",
      cell: (org) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-primary">{org.name}</span>
        </div>
      )
    },
    {
      key: "licenseNumber",
      header: "License (BIS)",
      cell: (org) => <Badge variant="outline">{org.licenseNumber || "N/A"}</Badge>
    },
    {
      key: "contact",
      header: "Contact",
      cell: (org) => (
        <div className="text-sm">
          <div className="font-medium">{org.contactEmail || "No Email"}</div>
          <div className="text-muted-foreground text-xs">{org.contactPhone || "No Phone"}</div>
        </div>
      )
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (org) => <span className="text-sm text-muted-foreground">{format(new Date(org.createdAt), "MMM d, yyyy")}</span>
    },
    {
      key: "status",
      header: "Status",
      cell: (org) => (
        <Badge variant={org.isActive ? "default" : "secondary"} className={org.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
          {org.isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
    {
      key: "actions",
      header: "Actions",
      cell: (org) => (
        <div className="flex justify-end">
          <Link href={`/organizations/${org.id}`}>
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
        searchKey="name"
        searchPlaceholder="Search by organization name..."
        emptyMessage="No organizations found."
      />
    </div>
  );
}