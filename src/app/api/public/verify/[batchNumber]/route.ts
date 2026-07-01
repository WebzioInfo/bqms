import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

function getBaseUrl(req: Request) {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.APP_URL) return process.env.APP_URL;
  
  const host = req.headers.get("host");
  const protocol = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  if (host) {
    return `${protocol}://${host}`;
  }
  return "";
}

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

export async function GET(req: Request, props: { params: Promise<{ batchNumber: string }> }) {
  const corsHeaders = getCorsHeaders(req);
  const successHeaders = {
    ...corsHeaders,
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
  };

  try {
    const { batchNumber } = await props.params;

    if (!batchNumber) {
      return NextResponse.json({ success: false, message: "Batch not found." }, { status: 400, headers: corsHeaders });
    }

    const trimmedBatch = batchNumber.trim();
    if (!trimmedBatch) {
      return NextResponse.json({ success: false, message: "Batch not found." }, { status: 400, headers: corsHeaders });
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
          include: {
            parameter: true
          }
        }
      }
    });

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null;
    const userAgent = req.headers.get("user-agent") || null;

    // 2. Log verification request to VerificationRecord
    try {
      await prisma.verificationRecord.create({
        data: {
          batchNumber: trimmedBatch,
          ipAddress,
          userAgent,
          isValid: !!report
        }
      });
    } catch (logError) {
      console.error("Failed to log verification scan:", logError);
    }

    if (!report) {
      return NextResponse.json({ success: false, message: "Batch not found." }, { status: 404, headers: corsHeaders });
    }

    // 3. Load Organization details
    const org = await prisma.organization.findUnique({
      where: { id: report.organizationId }
    });

    if (!org || !org.isActive) {
      return NextResponse.json({ success: false, message: "Batch not found." }, { status: 404, headers: corsHeaders });
    }

    // 4. Map parameters
    const phResult = report.results.find(r => r.parameter.name.toLowerCase() === "ph");
    const tdsResult = report.results.find(r => r.parameter.name.toLowerCase() === "tds");
    const turbidityResult = report.results.find(r => r.parameter.name.toLowerCase() === "turbidity");

    const ph = phResult ? (phResult.value !== null ? phResult.value : (phResult.stringValue ? parseFloat(phResult.stringValue) : null)) : null;
    const tds = tdsResult ? (tdsResult.value !== null ? tdsResult.value : (tdsResult.stringValue ? parseFloat(tdsResult.stringValue) : null)) : null;
    
    let turbidity = null;
    if (turbidityResult) {
      if (turbidityResult.stringValue) {
        turbidity = turbidityResult.stringValue;
      } else if (turbidityResult.value !== null) {
        turbidity = `${turbidityResult.value} NTU`;
      }
    }

    const microbiologyResults = report.results.filter(r => r.parameter.category === "MICROBIOLOGY");
    let microbiology = null;
    if (microbiologyResults.length > 0) {
      const failedParams = microbiologyResults
        .filter(r => !r.isPass || r.qualityStatus === "FAIL")
        .map(r => r.parameter.name);
      if (failedParams.length > 0) {
        microbiology = `Non-Compliant (Detected: ${failedParams.join(", ")})`;
      } else {
        microbiology = "Compliant (Absent)";
      }
    }

    const baseUrl = getBaseUrl(req);
    const downloadUrl = `${baseUrl}/api/public/verify/${encodeURIComponent(report.batchNumber)}/download`;

    // 5. Structure Response
    const response = {
      success: true,
      batchNumber: report.batchNumber,
      
      manufacturer: {
        name: org.name,
        address: org.address || null,
        location: null // Doesn't exist in DB schema
      },

      manufacturing: {
        mfgDate: report.productionDate 
          ? report.productionDate.toISOString().split("T")[0] 
          : report.sampleTime 
            ? report.sampleTime.toISOString().split("T")[0] 
            : null,
        bestBefore: null, // Doesn't exist in DB schema
        shelfLife: null // Doesn't exist in DB schema
      },

      licenses: {
        fssai: null, // Doesn't exist in DB schema
        bis: org.licenseNumber || null
      },

      waterQuality: {
        ph,
        tds,
        turbidity,
        microbiology,
        uv: null, // Doesn't exist in DB schema
        ozone: null // Doesn't exist in DB schema
      },

      report: {
        available: true,
        downloadUrl
      }
    };

    return NextResponse.json(response, { headers: successHeaders });

  } catch (error) {
    console.error("Public Verification API Error:", error);
    return NextResponse.json({ success: false, message: "Unable to verify batch." }, { status: 500, headers: corsHeaders });
  }
}

