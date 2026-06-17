import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { WaterTestReportsClient } from "./client";
import { redirect } from "next/navigation";

export default async function WaterTestReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  // @ts-ignore
  const userRole = session.user.role;
  // @ts-ignore
  const orgId = session.user.organizationId;

  let whereClause = {};
  if (userRole === "QC_USER" || userRole === "LAB_STAFF") {
    whereClause = { companyId: orgId };
  }

  const reports = await prisma.waterTestReport.findMany({
    where: whereClause,
    include: {
      batch: true,
      company: true,
      creator: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return <WaterTestReportsClient reports={reports} userRole={userRole} />;
}
