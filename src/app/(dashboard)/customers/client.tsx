"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users2, Phone, Mail } from "lucide-react";

interface CustomersClientProps {
  data: any[];
}

export function CustomersClient({ data }: CustomersClientProps) {
  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Customer",
      cell: (customer) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <Users2 className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <span className="font-semibold block">{customer.name}</span>
            <span className="text-xs text-muted-foreground block">{customer.organization?.name}</span>
          </div>
        </div>
      )
    },
    {
      key: "type",
      header: "Type",
      cell: (customer) => (
        <Badge variant="outline" className={customer.type === "DISTRIBUTOR" ? "bg-blue-50 text-blue-700" : "bg-zinc-50"}>
          {customer.type}
        </Badge>
      )
    },
    {
      key: "contact",
      header: "Contact",
      cell: (customer) => (
        <div className="text-sm">
          {customer.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3 text-muted-foreground"/> {customer.email}</div>}
          {customer.phone && <div className="flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3 text-muted-foreground"/> {customer.phone}</div>}
          {!customer.email && !customer.phone && <span className="text-muted-foreground">No contact info</span>}
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      cell: (customer) => (
        <Badge variant={customer.isActive ? "default" : "secondary"} className={customer.isActive ? "bg-green-100 text-green-800" : ""}>
          {customer.isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
    {
      key: "actions",
      header: "Actions",
      cell: (customer) => (
        <div className="flex justify-end">
          <Link href={`/customers/${customer.id}`}>
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
        searchPlaceholder="Search customers by name..."
        emptyMessage="No customers found."
      />
    </div>
  );
}
