"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Award, Building2, Package, Clock, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

interface CertificateDetailClientProps {
  certificate: any;
}

export function CertificateDetailClient({ certificate }: CertificateDetailClientProps) {
  const statusVariants: Record<string, string> = {
    "DRAFT": "bg-gray-100 text-gray-800",
    "ISSUED": "bg-green-100 text-green-800",
    "REVOKED": "bg-red-100 text-red-800",
    "EXPIRED": "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Info */}
      <Card className="md:col-span-2 shadow-sm rounded-xl overflow-hidden border-2 border-emerald-100">
        <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 pb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 mt-2">
            <Award className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl mb-2">Certificate of Compliance</CardTitle>
          <p className="text-muted-foreground">Standard: <strong className="text-foreground">{certificate.standard}</strong></p>
          <div className="mt-4 flex justify-center">
            <Badge variant="outline" className={statusVariants[certificate.status] || ""}>
              {certificate.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
            <div>
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4" /> Issue Date
              </dt>
              <dd className="text-lg font-semibold">{format(new Date(certificate.issueDate), "PPP")}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4" /> Expiry Date
              </dt>
              <dd className="text-lg font-semibold">{certificate.expiryDate ? format(new Date(certificate.expiryDate), "PPP") : "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4" /> Organization Issued To
              </dt>
              <dd className="text-lg font-medium text-primary">
                {certificate.organization?.name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                <Package className="h-4 w-4" /> Production Batch Ref
              </dt>
              <dd className="text-lg font-medium">
                {certificate.batchNumber || "Unknown"}
              </dd>
            </div>
          </dl>
          
          <div className="mt-8 p-4 bg-muted/20 border rounded-lg flex items-start gap-4">
            <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              This certificate verifies that the referenced production batch has been tested and complies with the quality requirements set forth in <strong>{certificate.standard}</strong>. Validity is subject to ongoing compliance and regular surveillance audits.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Side Widgets */}
      <div className="space-y-6">
        <Card className="shadow-sm rounded-xl">
          <CardHeader className="pb-3 border-b border-muted/50 bg-muted/20">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Linked QC Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {certificate.linkedReports && certificate.linkedReports.length > 0 ? (
              <div className="space-y-3">
                {certificate.linkedReports.map((report: any) => (
                  <div key={report.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{report.reportNumber}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(report.sampleTime), "PP")}</p>
                    </div>
                    {report.status === "APPROVED" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No QC reports associated with this batch reference.
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
                  <span className="font-medium">{format(new Date(certificate.createdAt), "PP")}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 py-2 border-b border-muted/30">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 flex justify-between">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="font-medium">{format(new Date(certificate.updatedAt), "PP")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
