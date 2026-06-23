"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ShieldAlert, Building2, Clock, CheckCircle2, FileText } from "lucide-react";

interface ComplianceDetailClientProps {
  record: any;
}

export function ComplianceDetailClient({ record }: ComplianceDetailClientProps) {
  const statusVariants: Record<string, string> = {
    "OPEN": "bg-red-100 text-red-800",
    "IN_PROGRESS": "bg-yellow-100 text-yellow-800",
    "IN_REVIEW": "bg-blue-100 text-blue-800",
    "CLOSED": "bg-green-100 text-green-800",
  };

  const typeMap: Record<string, string> = {
    "AUDIT_FINDING": "Audit Finding",
    "NCR": "Non-Conformance (NCR)",
    "CUSTOMER_COMPLAINT": "Customer Complaint",
    "CAPA": "Corrective Action (CAPA)",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Info */}
      <Card className="md:col-span-2 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-muted/50 pb-4">
          <CardTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              Finding Details
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-zinc-50">
                {typeMap[record.type] || record.type}
              </Badge>
              <Badge variant="outline" className={statusVariants[record.status] || ""}>
                {record.status.replace("_", " ")}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
            <div className="text-base bg-muted/10 p-4 rounded-lg border whitespace-pre-wrap leading-relaxed">
              {record.description}
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8 mb-8">
            <div>
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4" /> Organization
              </dt>
              <dd className="text-base font-medium text-primary">{record.organization?.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4" /> Due Date
              </dt>
              <dd className="text-base font-medium">
                {record.dueDate ? (
                  <span className={new Date(record.dueDate) < new Date() && record.status !== "CLOSED" ? "text-red-600 font-bold" : ""}>
                    {format(new Date(record.dueDate), "PPP")}
                  </span>
                ) : (
                  "No deadline"
                )}
              </dd>
            </div>
          </dl>

          {/* Resolution Info */}
          {(record.resolutionInfo || record.resolvedAt) && (
            <div className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <h3 className="text-sm font-semibold text-emerald-800 flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5" /> CAPA & Resolution Action
              </h3>
              {record.resolutionInfo ? (
                <div className="text-sm text-emerald-900 bg-white p-4 rounded-lg border border-emerald-100 whitespace-pre-wrap leading-relaxed">
                  {record.resolutionInfo}
                </div>
              ) : (
                <div className="text-sm text-emerald-700 italic">Resolution details not provided.</div>
              )}
              {record.resolvedAt && (
                <p className="text-xs text-emerald-700 mt-3 font-medium">
                  Closed on {format(new Date(record.resolvedAt), "PPP 'at' p")}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Side Widgets */}
      <div className="space-y-6">
        <Card className="shadow-sm rounded-xl">
          <CardHeader className="pb-3 border-b border-muted/50 bg-muted/20">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" /> Attachments & Evidence
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-center py-6 text-muted-foreground text-sm">
              Attachment system to be implemented.
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">System Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 py-2 border-b border-muted/30">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 flex justify-between">
                  <span className="text-muted-foreground">Logged On</span>
                  <span className="font-medium">{format(new Date(record.createdAt), "PP")}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-muted/30">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium">{format(new Date(record.updatedAt), "PP")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
