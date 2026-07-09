import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ReportGeneratorService, ReportData } from "@/lib/reports";
import { format } from "date-fns";
import { STATIC_PARAMETERS } from "@/app/(dashboard)/test-reports/components/types";

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  const allowedOriginsStr = process.env.ALLOWED_PUBLIC_ORIGINS || "";
  const allowedOrigins = allowedOriginsStr.split(",").map(o => o.trim()).filter(Boolean);

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  
  return headers;
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ batchNumber: string }> }
) {
  const corsHeaders = getCorsHeaders(req);
  const successHeaders = {
    ...corsHeaders,
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
  };

  try {
    const { batchNumber } = await props.params;

    if (!batchNumber) {
      return new NextResponse("Batch number is required", { status: 400, headers: corsHeaders });
    }

    const trimmedBatch = batchNumber.trim();
    if (!trimmedBatch) {
      return new NextResponse("Batch number is required", { status: 400, headers: corsHeaders });
    }

    // 1. Search database for the active report matching batchNumber case-insensitively
    const report = await prisma.waterTestReport.findFirst({
      where: {
        batchNumber: {
          equals: trimmedBatch,
          mode: "insensitive"
        },
        isActive: true
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        results: {
          include: { parameter: true },
        },
      },
    });

    if (!report) {
      return new NextResponse("Report not found", { status: 404, headers: corsHeaders });
    }

    // 2. Load Organization details
    const org = await prisma.organization.findUnique({
      where: { id: report.organizationId },
    });

    if (!org || !org.isActive) {
      return new NextResponse("Organization not active or not found", { status: 404, headers: corsHeaders });
    }

    // 3. Format metadata SECURELY (Never expose remarks, internal IDs, tenant IDs, or user IDs)
    const metadata: Record<string, string> = {
      "Company": org.name || "N/A",
      "Batch Number": report.batchNumber || "—",
      "Production Date": report.productionDate ? format(new Date(report.productionDate), "dd MMM yyyy") : "—",
      "Sample Time": report.sampleTime ? format(new Date(report.sampleTime), "dd MMM yyyy, hh:mm a") : "—",
      "Report Type": report.reportType || "—",
      "Overall Status": report.status,
    };

    // 4. Format rows for parameters
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
        if (param.category === "MICROBIOLOGY") {
          displayVal = "Not Entered";
        } else if (param.unit === "Descriptor" || param.id === "Colour" || param.id === "Odour" || param.id === "Taste") {
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
        standardStr = `≥ ${param.minAcceptable}`;
      } else if (param.maxAcceptable !== null) {
        standardStr = `≤ ${param.maxAcceptable}`;
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

    // 5. Generate PDF dynamically using the ReportGeneratorService
    const buffer = await ReportGeneratorService.generate(reportData, "pdf");

    const responseBody = typeof buffer === "string" ? buffer : new Uint8Array(buffer);

    return new NextResponse(responseBody, {
      status: 200,
      headers: {
        ...successHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="public_report_${report.batchNumber}.pdf"`,
      },
    });

  } catch (error) {
    console.error("Public PDF Export error:", error);
    return new NextResponse("Unable to verify batch.", { status: 500, headers: corsHeaders });
  }
}
