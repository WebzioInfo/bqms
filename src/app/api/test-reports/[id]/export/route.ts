import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { ReportGeneratorService, ReportData } from "@/lib/reports";
import { format } from "date-fns";
import { STATIC_PARAMETERS } from "@/app/(dashboard)/test-reports/components/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const formatType = searchParams.get("format") || "pdf";

    const report = await prisma.waterTestReport.findUnique({
      where: { id },
      include: {
        results: {
          include: { parameter: true },
        },
      },
    });

    if (!report) {
      return new NextResponse("Report not found", { status: 404 });
    }

    const org = await prisma.organization.findUnique({
      where: { id: report.organizationId },
    });

    // Format metadata
    const metadata: Record<string, string> = {
      "Report Number": report.id.substring(0, 8).toUpperCase(),
      "Company": org?.name || "N/A",
      "Batch Number": report.batchNumber || "—",
      "Production Date": report.productionDate ? format(new Date(report.productionDate), "dd MMM yyyy") : "—",
      "Sample Time": report.sampleTime ? format(new Date(report.sampleTime), "dd MMM yyyy, hh:mm a") : "—",
      "Report Type": report.reportType || "—",
      "Collected By": report.collectedBy || "—",
      "Tested By": report.testedBy || "—",
      "Verified By": report.verifiedBy || "—",
      "Overall Status": report.status,
    };

    if (report.remarks || report.remarks === "") {
      metadata["Remarks"] = report.remarks || "—";
    } else {
      metadata["Remarks"] = "—";
    }

    // Format rows
    const headers = ["Parameter", "Category", "Result", "Unit", "Standard", "Status"];
    const rows: string[][] = STATIC_PARAMETERS.map((param) => {
      const res = report.results.find(
        (r: any) => r.parameter?.name === param.name || r.parameterId === param.id
      );
      
      let displayVal = "—";
      let statusStr = "—";
      
      if (res) {
        displayVal = res.stringValue || (res.value !== null && res.value !== undefined ? String(res.value) : "—");
        statusStr = res.qualityStatus || (res.isPass ? "PASS" : "FAIL");
      } else {
        // Default display rules
        if (param.category === "MICROBIOLOGY") {
          displayVal = "Not Entered";
        } else if (param.unit === "Descriptor" || param.id === "Odour" || param.id === "Taste") {
          displayVal = "—";
        } else {
          displayVal = "0";
        }
        statusStr = "—";
      }

      let standardStr = "—";
      if (param.minAcceptable !== null && param.maxAcceptable !== null) {
        standardStr = param.minAcceptable === param.maxAcceptable 
          ? String(param.minAcceptable) 
          : `${param.minAcceptable} - ${param.maxAcceptable}`;
      } else if (param.minAcceptable !== null) {
        standardStr = `>= ${param.minAcceptable}`;
      } else if (param.maxAcceptable !== null) {
        standardStr = `<= ${param.maxAcceptable}`;
      }

      return [
        param.name,
        param.category,
        displayVal,
        param.unit || "",
        standardStr,
        statusStr
      ];
    });

    const reportData: ReportData = {
      title: "WATER QUALITY CONTROL TEST CERTIFICATE",
      metadata,
      headers,
      rows,
    };

    const buffer = await ReportGeneratorService.generate(reportData, formatType as any);

    const contentType = formatType === "pdf" ? "application/pdf" : "application/octet-stream";
    const extension = formatType;

    const responseBody = typeof buffer === "string" ? buffer : new Uint8Array(buffer);

    return new NextResponse(responseBody, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="report_${report.batchNumber || id}.${extension}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
