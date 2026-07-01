"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { Award, Building2, Clock, ShieldCheck, CheckCircle2, XCircle, ArrowLeft, Edit, Printer } from "lucide-react";

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

  const handleDownloadPDF = async () => {
    try {
      const pdfMakeModule = await import("pdfmake/build/pdfmake");
      const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
      const pdfMake = (pdfMakeModule.default || pdfMakeModule) as any;
      const pdfFonts = (pdfFontsModule.default || pdfFontsModule) as any;

      if (pdfMake && pdfFonts && pdfFonts.pdfMake) {
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
      }

      const documentDefinition = {
        content: [
          { text: "CERTIFICATE OF COMPLIANCE", style: "header", alignment: "center" },
          { text: `Certificate Number: ${certificate.certificateNumber || certificate.id.substring(0, 8).toUpperCase()}`, style: "subheader", alignment: "center", margin: [0, 10, 0, 20] },
          {
            canvas: [
              { type: "rect", x: 0, y: 0, w: 515, h: 5, color: "#10b981" } // Emerald line
            ],
            margin: [0, 0, 0, 30]
          },
          {
            table: {
              widths: ["35%", "65%"],
              body: [
                [
                  { text: "Certificate Name:", style: "tableHeader" },
                  { text: certificate.standard || "BIS IS 14543", style: "tableCell" }
                ],
                [
                  { text: "Issue Date:", style: "tableHeader" },
                  { text: format(new Date(certificate.issueDate), "PPP"), style: "tableCell" }
                ],
                [
                  { text: "Expiry Date:", style: "tableHeader" },
                  { text: certificate.expiryDate ? format(new Date(certificate.expiryDate), "PPP") : "N/A", style: "tableCell" }
                ],
                [
                  { text: "Status:", style: "tableHeader" },
                  { text: certificate.status, style: "tableCell" }
                ],
                [
                  { text: "Issued To Organization:", style: "tableHeader" },
                  { text: certificate.organization?.name || "N/A", style: "tableCell" }
                ],
                [
                  { text: "Linked QC Report:", style: "tableHeader" },
                  { text: certificate.linkedReports?.[0]?.reportNumber || "N/A", style: "tableCell" }
                ]
              ]
            },
            layout: "noBorders",
            margin: [0, 0, 0, 40]
          },
          {
            text: "CERTIFICATION STATEMENT",
            style: "sectionHeader",
            margin: [0, 0, 0, 10]
          },
          {
            text: `This certificate verifies that the referenced QC report has been tested and complies with the quality requirements set forth in ${certificate.standard || "BIS IS 14543"}. Validity is subject to ongoing compliance and regular surveillance audits.`,
            style: "statement",
            margin: [0, 0, 0, 50]
          },
          {
            columns: [
              {
                width: "*",
                text: ""
              },
              {
                width: "200",
                stack: [
                  { text: "APPROVED SIGNATORY", style: "sigTitle", alignment: "center" },
                  { text: "___________________________", margin: [0, 20, 0, 5], alignment: "center" },
                  { text: "Quality Assurance Manager", style: "sigSub", alignment: "center" },
                  { text: "Digitally Signed & Verified", style: "sigVerified", alignment: "center" }
                ]
              }
            ]
          }
        ],
        styles: {
          header: { fontSize: 24, bold: true, color: "#065f46" },
          subheader: { fontSize: 14, color: "#6b7280" },
          tableHeader: { fontSize: 11, bold: true, color: "#374151", margin: [0, 5, 0, 5] },
          tableCell: { fontSize: 11, color: "#1f2937", margin: [0, 5, 0, 5] },
          sectionHeader: { fontSize: 14, bold: true, color: "#047857" },
          statement: { fontSize: 11, color: "#4b5563", lineHeight: 1.5 },
          sigTitle: { fontSize: 11, bold: true, color: "#374151" },
          sigSub: { fontSize: 10, color: "#6b7280" },
          sigVerified: { fontSize: 8, italic: true, color: "#10b981", margin: [0, 5, 0, 0] }
        }
      };

      pdfMake.createPdf(documentDefinition).download(`certificate_${certificate.certificateNumber || certificate.id}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls inside client component for proper action handling */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/certificates">
            <Button variant="ghost" size="icon" className="rounded-full shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Certificate: {certificate.certificateNumber}</h1>
            <p className="text-muted-foreground mt-1 text-sm">Compliance & Certification Details</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="shadow-sm" onClick={handleDownloadPDF}>
            <Printer className="mr-2 h-4 w-4" /> Print PDF
          </Button>
          <Link href={`/certificates/${certificate.id}/edit`}>
            <Button variant="outline" className="shadow-sm">
              <Edit className="mr-2 h-4 w-4" /> Edit Certificate
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="md:col-span-2 shadow-sm rounded-xl overflow-hidden border-2 border-emerald-100">
          <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 pb-6 text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 mt-2">
              <Award className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl mb-2">Certificate of Compliance</CardTitle>
            <p className="text-muted-foreground">Certificate Name: <strong className="text-foreground">{certificate.standard}</strong></p>
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
            </dl>
            
            <div className="mt-8 p-4 bg-muted/20 border rounded-lg flex items-start gap-4">
              <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                This certificate verifies that the referenced QC report has been tested and complies with the quality requirements set forth in <strong>{certificate.standard}</strong>. Validity is subject to ongoing compliance and regular surveillance audits.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Side Widgets */}
        <div className="space-y-6">
          <Card className="shadow-sm rounded-xl">
            <CardHeader className="pb-3 border-b border-muted/50 bg-muted/20">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Linked QC Report
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
                  No QC report associated.
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
    </div>
  );
}
