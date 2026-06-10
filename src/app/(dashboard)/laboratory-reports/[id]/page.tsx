import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Beaker, Building2, PackageSearch, Calendar, FileText, CheckCircle2, AlertTriangle, Download } from "lucide-react";
import Link from "next/link";
import { DataTable, Column } from "@/components/ui/data-table";

export default async function ViewLaboratoryReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const report = await prisma.laboratoryReport.findUnique({
    where: { id: resolvedParams.id },
    include: { 
      batch: { include: { organization: true } },
      parameters: true
    }
  });

  if (!report) {
    notFound();
  }

  // Define columns for parameters table (Server Component using generic DataTable won't pass functions if DataTable is Client, but since our DataTable takes functions... wait! We can't pass functions to a client component from a server component!)
  // Since DataTable is a Client Component, we either make this page a client component or render a simple HTML table for parameters.
  // We will render a native table here for simplicity and SEO.

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-4 rounded-xl">
            <Beaker className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Laboratory Report</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={report.isCompliant ? "default" : "destructive"}>
                {report.isCompliant ? "COMPLIANT" : "NON-COMPLIANT"}
              </Badge>
              <Badge variant="outline">{report.reportedBy}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {report.reportFileUrl && (
            <a href={report.reportFileUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Original File</Button>
            </a>
          )}
          <Link href="/laboratory-reports">
            <Button variant="outline">Back</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Test Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.testDate.toLocaleDateString()}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Target Batch</CardTitle>
            <PackageSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono truncate">{report.batch.batchNumber}</div>
            <Link href={`/batches/${report.batchId}`} className="text-xs text-blue-500 hover:underline">View Batch</Link>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Organization</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">{report.batch.organization.name}</div>
            <Link href={`/organizations/${report.batch.organizationId}`} className="text-xs text-blue-500 hover:underline">View Organization</Link>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-muted">
        <CardHeader>
          <CardTitle>Tested Parameters</CardTitle>
          <CardDescription>Detailed results for all chemical and microbiological tests performed.</CardDescription>
        </CardHeader>
        <CardContent>
          {report.parameters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No parameter details were logged for this report.
            </div>
          ) : (
            <div className="relative w-full overflow-auto rounded-md border">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b bg-muted/50">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Parameter</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Value</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Standard Limits</th>
                    <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {report.parameters.map(param => (
                    <tr key={param.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">{param.name}</td>
                      <td className="p-4 align-middle"><Badge variant="outline" className="text-xs">{param.type}</Badge></td>
                      <td className="p-4 align-middle text-right">{param.value} {param.unit}</td>
                      <td className="p-4 align-middle text-right text-muted-foreground text-xs">
                        {param.standardMin !== null && param.standardMax !== null 
                          ? `${param.standardMin} - ${param.standardMax} ${param.unit}`
                          : param.standardMin !== null ? `> ${param.standardMin} ${param.unit}`
                          : param.standardMax !== null ? `< ${param.standardMax} ${param.unit}`
                          : "N/A"}
                      </td>
                      <td className="p-4 align-middle text-center">
                        {param.isCompliant ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-destructive mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
