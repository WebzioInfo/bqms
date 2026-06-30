"use server";

import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import {
  errorMessage,
  requireAnyRole,
  scopedOrganizationWhere,
} from "@/lib/auth/tenant-access";

export async function getDashboardMetrics() {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN, Role.QC]);
    const tenantWhere = scopedOrganizationWhere(user);
    const reportWhere = user.role === Role.QC ? { ...tenantWhere, createdBy: user.id } : tenantWhere;
    const complianceWhere = user.role === Role.QC ? { ...tenantWhere, createdBy: user.id } : tenantWhere;
    const queryOptions = { where: tenantWhere };

    const [
      totalCertificates,
      totalReports,
      totalComplianceIssues,
      totalUsers,
      totalOrganizations
    ] = await Promise.all([
      user.role === Role.QC ? Promise.resolve(0) : prisma.certificate.count(queryOptions),
      prisma.waterTestReport.count({ where: reportWhere }),
      prisma.nonConformanceRecord.count({
        where: { ...complianceWhere, status: { not: "CLOSED" } }
      }),
      user.role === Role.QC ? Promise.resolve(0) : prisma.user.count(queryOptions),
      user.role === Role.PLATFORM_ADMIN ? prisma.organization.count() : Promise.resolve(0)
    ]);

    // Fetch recent reports for a quick list
    const recentReports = await prisma.waterTestReport.findMany({
      where: reportWhere,
      select: {
        id: true,
        batchNumber: true,
        createdAt: true,
        sampleTime: true,
      },
      orderBy: { sampleTime: 'desc' },
      take: 5
    });
    const mappedReports = recentReports.map((report) => ({
      ...report,
      reportNumber: report.id.substring(0, 8).toUpperCase(),
    }));

    return { 
      success: true, 
      data: {
        totalCertificates,
        totalReports,
        totalComplianceIssues,
        totalUsers,
        totalOrganizations,
        recentReports: mappedReports
      } 
    };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}
