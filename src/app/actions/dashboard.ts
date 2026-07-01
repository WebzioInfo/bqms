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
    
    // Fetch all reports for the organization to compute Quality metrics
    const reportsForQuality = await prisma.waterTestReport.findMany({
      where: reportWhere,
      include: {
        results: {
          select: {
            qualityStatus: true,
            isPass: true
          }
        }
      }
    });

    let reportsPassed = 0;
    let reportsWithWarnings = 0;
    let reportsFailed = 0;

    for (const rep of reportsForQuality) {
      if (rep.results.length === 0) {
        reportsPassed++;
        continue;
      }
      const hasFail = rep.results.some(r => r.qualityStatus === "FAIL" || (!r.qualityStatus && r.isPass === false));
      if (hasFail) {
        reportsFailed++;
      } else {
        const hasWarning = rep.results.some(r => r.qualityStatus === "WARNING");
        if (hasWarning) {
          reportsWithWarnings++;
        } else {
          reportsPassed++;
        }
      }
    }

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
        recentReports: mappedReports,
        reportsPassed,
        reportsWithWarnings,
        reportsFailed
      } 
    };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}
