import { authenticateApiRequest, logRequest } from "@/lib/api/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = await authenticateApiRequest(req);
  if (!auth.isAuthenticated || !auth.organizationId) {
    return auth.errorResponse!;
  }

  const certificates = await prisma.certificate.findMany({
    where: { organizationId: auth.organizationId, isActive: true },
    orderBy: { issuedAt: "desc" }
  });

  const responseData = certificates.map(cert => {
    let extra = { certificateNumber: cert.id.substring(0, 8).toUpperCase(), standard: "BIS IS 14543" };
    if (cert.certificateUrl && cert.certificateUrl.startsWith("{")) {
      try { extra = JSON.parse(cert.certificateUrl); } catch (e) {}
    }

    return {
      certificateNumber: extra.certificateNumber,
      status: cert.status,
      issueDate: cert.issuedAt,
      standard: extra.standard
    };
  });

  await logRequest(auth.organizationId, auth.apiKeyId || null, req, 200);
  return NextResponse.json(responseData);
}
