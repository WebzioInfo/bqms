"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { FileText, Building2, Package, Clock, User, CheckCircle2, XCircle } from "lucide-react";

interface ReportDetailClientProps {
  report: any;
}

export function ReportDetailClient({ report }: ReportDetailClientProps) {
  const statusVariants: Record<string, string> = {
    "DRAFT": "bg-gray-100 text-gray-800",
    "SUBMITTED": "bg-yellow-100 text-yellow-800",
    "REVIEWED": "bg-blue-100 text-blue-800",
    "APPROVED": "bg-green-100 text-green-800",
    "PUBLISHED": "bg-emerald-100 text-emerald-800",
    "REJECTED": "bg-red-100 text-red-800",
    "RETEST_REQUIRED": "bg-orange-100 text-orange-800",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Info */}
      <Card className="md:col-span-2 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-muted/50 pb-4">
          <CardTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Report Information
            </div>
            <Badge variant="outline" className={statusVariants[report.status] || ""}>
              {report.status.replace("_", " ")}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
            <div>
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4" /> Sample Time
              </dt>
              <dd className="text-base font-semibold">{format(new Date(report.sampleTime), "PPP p")}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <User className="h-4 w-4" /> Tested By
              </dt>
              <dd className="text-base font-medium">{report.testedBy}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <Package className="h-4 w-4" /> Production Batch
              </dt>
              <dd className="text-base font-medium text-primary">
                {report.batchNumber || "Unknown"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4" /> Report Type
              </dt>
              <dd className="text-base font-medium">
                {report.reportType?.replace(/_/g, ' ') || "Unknown"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4" /> Sample Number
              </dt>
              <dd className="text-base font-medium">
                {report.sampleNumber || "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4" /> Organization
              </dt>
              <dd className="text-base font-medium text-primary">
                {report.organization?.name}
              </dd>
            </div>
            {report.remarks && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4" /> Remarks / Observations
                </dt>
                <dd className="text-base font-medium bg-muted/20 p-4 rounded-lg border mt-1">
                  {report.remarks}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Side Widgets */}
      <div className="space-y-6">
        <Card className="shadow-sm rounded-xl">
          <CardHeader className="pb-3 border-b border-muted/50 bg-muted/20">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Parameter Results
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {report.results && report.results.length > 0 ? (
              <div className="space-y-3">
                {report.results.map((res: any) => (
                  <div key={res.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{res.parameter?.name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{res.value} {res.parameter?.unit}</p>
                    </div>
                    {res.isPass ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No parameter test results recorded yet.
              </div>
            )}
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
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{format(new Date(report.createdAt), "PP")}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-muted/30">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="font-medium">{format(new Date(report.updatedAt), "PP")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
