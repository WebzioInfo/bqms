import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default async function ViewLaboratoryReportPage({ params }: { params: { id: string } }) {
  const report = await prisma.laboratoryReport.findUnique({
    where: { id: params.id },
    include: { batch: { include: { organization: true } } }
  });

  if (!report) {
    redirect("/laboratory-reports");
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Laboratory Report</h1>
        <p className="text-muted-foreground mt-1 text-sm">Test details for batch {report.batch.batchNumber}.</p>
      </div>

      <Card className="shadow-sm border-muted">
        <CardHeader>
          <CardTitle>Report Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p><strong>Organization:</strong> {report.batch.organization.name}</p>
            <p><strong>Reported By:</strong> {report.reportedBy}</p>
            <p><strong>Test Date:</strong> {report.testDate.toLocaleDateString()}</p>
            <p><strong>Status:</strong> {report.isCompliant ? "COMPLIANT" : "NON-COMPLIANT"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
