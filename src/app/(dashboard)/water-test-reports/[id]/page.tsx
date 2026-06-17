import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { WaterTestReportDetailClient } from "./client";

export default async function WaterTestReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  // @ts-ignore
  const userRole = session.user.role;
  // @ts-ignore
  const orgId = session.user.organizationId;

  const report = await prisma.waterTestReport.findUnique({
    where: { id: resolvedParams.id },
    include: {
      batch: true,
      company: {
        include: {
          waterTestParams: true // Need this to show the parameter form
        }
      },
      creator: true,
      results: {
        include: { parameter: true }
      },
      attachments: {
        include: { cloudFile: true }
      }
    }
  });

  if (!report) notFound();

  if (userRole === "QC_USER" || userRole === "LAB_STAFF") {
    if (report.companyId !== orgId) notFound();
  }

  return <WaterTestReportDetailClient report={report} userRole={userRole} />;
}
