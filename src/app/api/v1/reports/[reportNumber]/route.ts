import { authenticateApiRequest, logRequest } from "@/lib/api/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, props: { params: Promise<{ reportNumber: string }> }) {
  const { reportNumber } = await props.params;
  const auth = await authenticateApiRequest(req);
  if (!auth.isAuthenticated || !auth.organizationId) {
    return auth.errorResponse!;
  }

  // Resolve report by prefix search of its ID (since reportNumber is RPT-SUBSTRING)
  const reportPrefix = reportNumber.replace(/^RPT-/i, "").toLowerCase();
  const report = await prisma.waterTestReport.findFirst({
    where: {
      organizationId: auth.organizationId,
      id: {
        startsWith: reportPrefix
      },
      isActive: true
    },
    include: {
      results: {
        include: {
          parameter: true
        }
      }
    }
  });

  if (!report) {
    await logRequest(auth.organizationId, auth.apiKeyId || null, req, 404);
    return NextResponse.json({ error: `Report '${reportNumber}' not found for your company.` }, { status: 404 });
  }

  // Determine overall status
  const hasFail = report.results.some(
    r => r.qualityStatus === "FAIL" || (!r.qualityStatus && !r.isPass)
  );
  const hasWarning = report.results.some(r => r.qualityStatus === "WARNING");
  const overallStatus = hasFail ? "FAIL" : hasWarning ? "WARNING" : "PASS";

  const responseData = {
    reportNumber: `RPT-${report.id.substring(0, 8).toUpperCase()}`,
    batchNumber: report.batchNumber,
    reportType: report.reportType,
    productionDate: report.productionDate ? report.productionDate.toISOString().split("T")[0] : null,
    sampleTime: report.sampleTime ? report.sampleTime.toISOString() : null,
    overallStatus,
    testedBy: report.testedBy || "Quality Control Inspector",
    verifiedBy: report.verifiedBy || "Factory Quality Manager",
    remarks: report.remarks || "N/A",
    parameters: report.results.map(r => ({
      parameter: r.parameter.name,
      category: r.parameter.category,
      unit: r.parameter.unit,
      value: r.value !== null && r.value !== undefined ? r.value : (r.stringValue || "—"),
      status: r.qualityStatus || (r.isPass ? "PASS" : "FAIL")
    }))
  };

  await logRequest(auth.organizationId, auth.apiKeyId || null, req, 200);
  return NextResponse.json(responseData);
}
