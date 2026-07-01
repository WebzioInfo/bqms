import { authenticateApiRequest, logRequest } from "@/lib/api/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = await authenticateApiRequest(req);
  if (!auth.isAuthenticated || !auth.organizationId) {
    return auth.errorResponse!;
  }

  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  if (!query) {
    await logRequest(auth.organizationId, auth.apiKeyId || null, req, 400);
    return NextResponse.json({ error: "Missing query parameter 'q'." }, { status: 400 });
  }

  // 1. Search test reports by batchNumber or id prefix
  const reports = await prisma.waterTestReport.findMany({
    where: {
      organizationId: auth.organizationId,
      OR: [
        { batchNumber: { contains: query, mode: "insensitive" } },
        { id: { startsWith: query.replace(/^RPT-/i, "") } }
      ],
      isActive: true
    },
    take: 10
  });

  // 2. Search certificates by id prefix
  const certificates = await prisma.certificate.findMany({
    where: {
      organizationId: auth.organizationId,
      id: { startsWith: query.replace(/^CERT-/i, "") },
      isActive: true
    },
    take: 10
  });

  const responseData = {
    reports: reports.map(r => ({
      reportNumber: `RPT-${r.id.substring(0, 8).toUpperCase()}`,
      batchNumber: r.batchNumber,
      status: r.status,
      sampleTime: r.sampleTime
    })),
    certificates: certificates.map(c => {
      let extra = { certificateNumber: c.id.substring(0, 8).toUpperCase(), standard: "BIS IS 14543" };
      if (c.certificateUrl && c.certificateUrl.startsWith("{")) {
        try { extra = JSON.parse(c.certificateUrl); } catch (e) {}
      }
      return {
        certificateNumber: extra.certificateNumber,
        status: c.status,
        issueDate: c.issuedAt,
        standard: extra.standard
      };
    })
  };

  await logRequest(auth.organizationId, auth.apiKeyId || null, req, 200);
  return NextResponse.json(responseData);
}
