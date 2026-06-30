"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { User, Mail, Shield, Building2, Clock } from "lucide-react";

interface UserDetailClientProps {
  user: any;
}

export function UserDetailClient({ user }: UserDetailClientProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Info */}
      <Card className="md:col-span-2 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-muted/50 pb-4">
          <CardTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Account Information
            </div>
            <Badge variant={user.isActive ? "default" : "secondary"} className={user.isActive ? "bg-green-100 text-green-800" : ""}>
              {user.isActive ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
            <div>
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4" /> Email Address
              </dt>
              <dd className="text-base font-semibold">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4" /> Role
              </dt>
              <dd className="text-base font-medium">
                <Badge variant={
                  user.role === "PLATFORM_ADMIN" ? "default" :
                  user.role === "COMPANY_ADMIN" ? "secondary" : "outline"
                }>
                  {user.role}
                </Badge>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4" /> Organization Assignment
              </dt>
              <dd className="text-base font-medium bg-muted/20 p-3 rounded-lg border border-muted/40 mt-1">
                {user.organization?.name ? (
                  <span className="font-semibold text-primary">{user.organization.name}</span>
                ) : (
                  <span className="text-muted-foreground italic">Platform Level (No specific organization)</span>
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* System Info Widget */}
      <div className="space-y-6">
        <Card className="shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">System Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 py-2 border-b border-muted/30">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 flex justify-between">
                  <span className="text-muted-foreground">Joined</span>
                  <span className="font-medium">{format(new Date(user.createdAt), "PPp")}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-muted/30">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="font-medium">{format(new Date(user.updatedAt), "PPp")}</span>
                </div>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-xs text-muted-foreground truncate max-w-[120px]" title={user.id}>{user.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}