import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { CreateWaterTestClient } from "./client";

export default async function NewWaterTestPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  // @ts-ignore
  const userRole = session.user.role;
  // @ts-ignore
  const orgId = session.user.organizationId;

  if (userRole !== "QC_USER" && userRole !== "LAB_STAFF" && userRole !== "SUPER_ADMIN" && userRole !== "BIOFIX_ADMIN") {
    redirect("/water-test-reports");
  }

  // Fetch batches available for testing
  let batches = [];
  if (orgId) {
    batches = await prisma.batch.findMany({
      where: { 
        organizationId: orgId,
        waterTestReports: {
          none: {} // only batches without tests for now, or allow multiple? The UI just needs a batch list.
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  } else {
    batches = await prisma.batch.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }

  return <CreateWaterTestClient batches={batches} companyId={orgId || ""} />;
}
