import { authenticateApiRequest, logRequest } from "@/lib/api/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const auth = await authenticateApiRequest(req);
  if (!auth.isAuthenticated || !auth.organizationId) {
    return auth.errorResponse!;
  }

  const org = await prisma.organization.findUnique({
    where: { id: auth.organizationId }
  });

  if (!org) {
    await logRequest(auth.organizationId, auth.apiKeyId || null, req, 404);
    return NextResponse.json({ error: "Company organization not found." }, { status: 404 });
  }

  const responseData = {
    licenceNumber: org.licenseNumber || "N/A",
    standard: "BIS IS 14543",
    validity: "Permanent / Active",
    status: org.isActive ? "VALID" : "INVALID"
  };

  await logRequest(auth.organizationId, auth.apiKeyId || null, req, 200);
  return NextResponse.json(responseData);
}
