"use server";

import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import {
  errorMessage,
  requireAnyRole,
  scopedOrganizationWhere,
} from "@/lib/auth/tenant-access";

export async function getReportsData() {
  try {
    const user = await requireAnyRole([Role.PLATFORM_ADMIN, Role.COMPANY_ADMIN]);
    const tenantWhere = scopedOrganizationWhere(user);
    const queryOptions = { where: tenantWhere };

    // Fetch certificates grouped by month (simplistic approach for sqlite/postgres)
    // We will just fetch the last 100 certificates and group them in JS for simplicity
    const certificates = await prisma.certificate.findMany({
      where: tenantWhere,
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 365
    });

    // Group by month
    const monthlyData: Record<string, { month: string; certificates: number }> = {};
    certificates.forEach(c => {
      const month = new Date(c.createdAt).toLocaleString('default', { month: 'short' });
      if (!monthlyData[month]) monthlyData[month] = { month, certificates: 0 };
      monthlyData[month].certificates += 1;
    });

    const chartData = Object.values(monthlyData).reverse();

    // Compliance stats
    const compliance = await prisma.nonConformanceRecord.groupBy({
      by: ['severity'],
      _count: true,
      where: tenantWhere
    });

    const complianceData = compliance.map(c => ({
      name: c.severity,
      value: c._count
    }));

    return { 
      success: true, 
      data: {
        chartData: chartData.length ? chartData : [{ month: 'Current', certificates: 0 }],
        complianceData: complianceData.length ? complianceData : [{ name: 'None', value: 1 }]
      } 
    };
  } catch (error) {
    return { success: false, error: errorMessage(error) };
  }
}
