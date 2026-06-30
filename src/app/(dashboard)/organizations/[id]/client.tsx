"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Building2, Mail, Phone, MapPin, CheckCircle2, ShieldAlert, Package, Users } from "lucide-react";

interface OrganizationDetailClientProps {
  organization: any;
  stats: {
    usersCount: number;
    certificatesCount: number;
    ncrCount: number;
  };
}

export function OrganizationDetailClient({ organization, stats }: OrganizationDetailClientProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Info */}
      <Card className="md:col-span-2 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-muted/50 pb-4">
          <CardTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              General Information
            </div>
            <Badge variant={organization.isActive ? "default" : "secondary"} className={organization.isActive ? "bg-green-100 text-green-800" : ""}>
              {organization.isActive ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
            <div>
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4" /> BIS License Number
              </dt>
              <dd className="text-base font-semibold">{organization.licenseNumber || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <Mail className="h-4 w-4" /> Contact Email
              </dt>
              <dd className="text-base font-medium">{organization.contactEmail || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <Phone className="h-4 w-4" /> Contact Phone
              </dt>
              <dd className="text-base font-medium">{organization.contactPhone || "N/A"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4" /> Registered Address
              </dt>
              <dd className="text-base font-medium bg-muted/20 p-3 rounded-lg border border-muted/40 mt-1">
                {organization.address || "No address provided."}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Stats Widget */}
      <div className="space-y-6">
        <Card className="shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center p-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
              <Users className="h-5 w-5 text-blue-500 mr-3" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Active Users</div>
                <div className="text-xl font-bold">{stats.usersCount}</div>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-purple-50/50 rounded-lg border border-purple-100/50">
              <Package className="h-5 w-5 text-purple-500 mr-3" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Certificates Issued</div>
                <div className="text-xl font-bold">{stats.certificatesCount}</div>
              </div>
            </div>

            <div className="flex items-center p-3 bg-amber-50/50 rounded-lg border border-amber-100/50">
              <ShieldAlert className="h-5 w-5 text-amber-500 mr-3" />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">Open NCRs</div>
                <div className="text-xl font-bold">{stats.ncrCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">System Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-muted/30">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{format(new Date(organization.createdAt), "PPp")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-muted/30">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">{format(new Date(organization.updatedAt), "PPp")}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono text-xs text-muted-foreground truncate max-w-[120px]" title={organization.id}>{organization.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}