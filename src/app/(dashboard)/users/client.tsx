"use client";

import { DataTable, Column } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { User } from "lucide-react";

interface UsersClientProps {
  data: any[];
}

export function UsersClient({ data }: UsersClientProps) {
  const columns: Column<any>[] = [
    {
      key: "name",
      header: "User",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      )
    },
    {
      key: "role",
      header: "Role",
      cell: (user) => (
        <Badge variant={
          user.role === "PLATFORM_ADMIN" ? "default" :
          user.role === "COMPANY_ADMIN" ? "secondary" : "outline"
        }>
          {user.role}
        </Badge>
      )
    },
    {
      key: "organization",
      header: "Organization",
      cell: (user) => <span className="text-sm font-medium">{user.organization?.name || "Platform"}</span>
    },
    {
      key: "status",
      header: "Status",
      cell: (user) => (
        <Badge variant={user.isActive ? "default" : "secondary"} className={user.isActive ? "bg-green-100 text-green-800" : ""}>
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
    {
      key: "actions",
      header: "Actions",
      cell: (user) => (
        <div className="flex justify-end">
          <Link href={`/users/${user.id}`}>
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
        searchPlaceholder="Search by user name or email..."
        emptyMessage="No users found."
      />
    </div>
  );
}
