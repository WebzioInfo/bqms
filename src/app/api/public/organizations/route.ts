import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

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

export async function GET(req: Request) {
  const corsHeaders = getCorsHeaders(req);
  const successHeaders = {
    ...corsHeaders,
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300"
  };

  try {
    const orgs = await prisma.organization.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        address: true,
        licenseNumber: true,
        contactEmail: true,
        contactPhone: true,
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ success: true, data: orgs }, { headers: successHeaders });
  } catch (error) {
    console.error("Public Organizations API Error:", error);
    return NextResponse.json({ success: false, message: "Unable to fetch organizations." }, { status: 500, headers: corsHeaders });
  }
}
