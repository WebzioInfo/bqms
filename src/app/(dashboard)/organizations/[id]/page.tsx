import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { OrganizationDetailClient } from "./client";

export default async function OrganizationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  // @ts-ignore
  const userRole = session?.user?.role;
  // @ts-ignore
  const orgId = session?.user?.organizationId;

  // Enforce access control if not an admin
  if (userRole !== "SUPER_ADMIN" && userRole !== "BIOFIX_ADMIN") {
    if (orgId !== resolvedParams.id) {
      notFound();
    }
  }

  const organization = await prisma.organization.findUnique({
    where: { id: resolvedParams.id },
    include: {
      users: true,
      batches: {
        orderBy: { createdAt: "desc" }
      },
      inspections: {
        include: { inspector: true },
        orderBy: { inspectionDate: "desc" }
      },
      qrCodes: {
        include: { 
          _count: { select: { scans: true } },
          scans: {
            orderBy: { scannedAt: "desc" }
          }
        },
        orderBy: { createdAt: "desc" }
      },
      certificates: {
        include: { batch: true },
        orderBy: { issueDate: "desc" }
      },
      trustScoreHistory: {
        orderBy: { recordedAt: "asc" }
      },
      waterTestParams: {
        orderBy: [{ type: "asc" }, { name: "asc" }]
      }
    }
  });

  if (!organization) {
    notFound();
  }

  // We also need laboratory reports across all batches of this organization
  const labReports = await prisma.laboratoryReport.findMany({
    where: {
      batch: {
        organizationId: organization.id
      }
    },
    include: {
      batch: true,
      parameters: true
    },
    orderBy: { testDate: "desc" }
  });

  // Fetch recent audit logs for this organization (simulated or real depending on schema)
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      entityId: organization.id
    },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  // Pre-calculate aggregate metrics to pass to client
  const totalInspections = organization.inspections.length;
  const passedInspections = organization.inspections.filter(i => i.complianceStatus === "PASS").length;
  const totalLabReports = labReports.length;
  const passedLabReports = labReports.filter(r => r.isCompliant).length;
  
  const totalTests = totalInspections + totalLabReports;
  const passedTests = passedInspections + passedLabReports;
  const complianceScore = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  const openIssues = (totalInspections - passedInspections) + (totalLabReports - passedLabReports);

  const totalQrScans = organization.qrCodes.reduce((sum, qr) => sum + (qr._count?.scans || 0), 0);
  const activeCertificates = organization.certificates.filter(c => c.status === "ACTIVE").length;

  return (
    <OrganizationDetailClient 
      organization={organization} 
      labReports={labReports}
      auditLogs={auditLogs}
      metrics={{
        totalInspections,
        activeCertificates,
        totalQrScans,
        totalLabReports,
        complianceScore,
        openIssues
      }}
    />
  );
}
