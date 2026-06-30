import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { ReportGeneratorService, ReportData } from "@/lib/reports";
import { format } from "date-fns";

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
        organization: true,
      },
    });

    if (!report) {
      return new NextResponse("Report not found", { status: 404 });
    }

    // Format metadata
    const metadata: Record<string, string> = {
      "Report Number": report.reportNumber || report.id.substring(0, 8).toUpperCase(),
      "Company": report.organization?.name || "N/A",
      "Batch Number": report.batchNumber || "N/A",
      "Production Date": report.productionDate ? format(new Date(report.productionDate), "dd MMM yyyy") : "N/A",
      "Sample Time": report.sampleTime ? format(new Date(report.sampleTime), "dd MMM yyyy, hh:mm a") : "N/A",
      "Report Type": report.reportType,
      "Collected By": report.collectedBy || "N/A",
      "Tested By": report.testedBy || "N/A",
      "Verified By": report.verifiedBy || "N/A",
      "Overall Status": report.status,
    };

    if (report.remarks) {
      metadata["Remarks"] = report.remarks;
    }

    // Format rows
    const headers = ["Parameter", "Category", "Result", "Unit", "Standard", "Status"];
    const rows: string[][] = report.results.map((res: any) => {
      const p = res.parameter;
      if (!p) return [];

      let standardStr = "—";
      if (p.minAcceptable !== null && p.maxAcceptable !== null) {
        standardStr = p.minAcceptable === p.maxAcceptable 
          ? String(p.minAcceptable) 
          : `${p.minAcceptable} - ${p.maxAcceptable}`;
      } else if (p.minAcceptable !== null) {
        standardStr = `>= ${p.minAcceptable}`;
      } else if (p.maxAcceptable !== null) {
        standardStr = `<= ${p.maxAcceptable}`;
      }

      let statusStr = "PASS";
      if (!res.isPass) {
        statusStr = "FAIL";
      }

      return [
        p.name,
        p.category,
        res.stringValue || String(res.value || 0),
        p.unit || "",
        standardStr,
        statusStr
      ];
    }).filter((r: string[]) => r.length > 0);

    const reportData: ReportData = {
      title: "WATER QUALITY CONTROL TEST CERTIFICATE",
      metadata,
      headers,
      rows,
    };

    const buffer = await ReportGeneratorService.generate(reportData, formatType as any);

    const contentType = formatType === "pdf" ? "application/pdf" : "application/octet-stream";
    const extension = formatType;

    return new NextResponse(buffer, {
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
