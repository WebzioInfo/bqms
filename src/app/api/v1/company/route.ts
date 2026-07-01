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
    companyName: org.name,
    factoryName: `${org.name} Factory`,
    address: org.address || "N/A",
    contactPerson: "Quality Manager",
    email: org.contactEmail || "N/A",
    phone: org.contactPhone || "N/A",
    gstNumber: "N/A",
    bisLicenceNumber: org.licenseNumber || "N/A",
    licenceValidUntil: "N/A",
    licenceStatus: org.isActive ? "ACTIVE" : "INACTIVE"
  };

  await logRequest(auth.organizationId, auth.apiKeyId || null, req, 200);
  return NextResponse.json(responseData);
}
